# VAC Caja Web — Membership & Operational Shell v1

## 1. Arquitectura de la query

La resolución vive en `features/membership/` y mantiene esta dirección:

```text
app/caja/page.tsx
→ MembershipShell
→ useMembershipResolution
→ fetchMembershipResolution
→ Supabase browser client
```

`app/caja/page.tsx` conserva la validación SSR de sesión antes de montar el shell cliente. `features/membership/hooks/use-membership-resolution.ts` habilita la query sólo cuando `AuthProvider` está listo y existe `userId`.

La clave es:

```text
['vac-caja', 'authenticated', userId, 'membership-resolution']
```

No se fabrica un `businessId` antes de resolver membresía. La clave queda bajo `authenticatedRoot`, por lo que la limpieza existente en logout, expiración y cambio de usuario también elimina la membresía.

## 2. Campos leídos

`features/membership/services/membership-service.ts` consulta `business_members` con los filtros:

```text
profile_id = authenticated userId
status = active
```

Campos solicitados:

```text
business_members.id
business_members.business_id
business_members.profile_id
business_members.role
business_members.status
business_members.login_username
profiles.full_name
businesses.name
businesses.cashier_login_code
```

No se solicitan billing, Stripe, Wallet, programas, clientes, sucursales, analytics ni suscripciones.

### Corrección de relación de perfil (PGRST201)

PostgREST encontró dos relaciones entre `business_members` y `profiles`: la identidad del miembro mediante `profile_id` y el perfil creador mediante `created_by_profile_id`. El embed ambiguo causaba `PGRST201` en runtime.

La query selecciona ahora explícitamente:

```text
profile:profiles!business_members_profile_id_fkey(full_name)
```

Esto conserva el alias y el shape existente, pero garantiza que la identidad mostrada corresponde al miembro actual y no al creador de la membresía. Una prueba de contrato confirma el FK requerido y excluye `business_members_created_by_profile_id_fkey`. La validación local de la corrección pasó 10 archivos/49 tests, lint, TypeScript, build webpack y `git diff --check`.

## 3. Límite RLS/cliente

La lectura usa `lib/supabase/client.ts`, URL pública, publishable/anon key pública y la sesión cookie-aware existente. La consulta queda sujeta a RLS.

No existe BFF, admin client, `service_role`, password de base de datos ni cambio de backend. La UI no se considera frontera de autorización para futuras operaciones sensibles.

## 4. Cardinalidad

`features/membership/domain/membership-resolution.ts` clasifica explícitamente:

- 0 filas: `no-active-membership`;
- 1 fila: valida y construye `resolved`;
- más de 1 fila: `multiple-active-memberships`.

No se usa `.single()`, `.first()`, orden, límite ni selección automática. El estado múltiple bloquea Caja y explica que todavía no existe selector de negocios.

## 5. Rol autoritativo

Sólo `business_members.role` define presentación owner/cashier. `owner` y `cashier` son los únicos valores aceptados. Otro rol produce un resultado seguro `error/unsupported-role` y nunca entra al shell resuelto.

No se infiere rol desde email, alias, login username, ruta o estado de Auth cliente.

## 6. Identidad owner

Para una membresía `owner`, el servicio solicita `supabase.auth.getUser()` después de confirmar cardinalidad única y verifica que el ID coincide con el `userId` consultado.

`features/membership/domain/display-identity.ts` produce únicamente:

- `profile.full_name` o `Cuenta propietaria`;
- email Auth real o `Correo no disponible`;
- label `Owner`.

IDs internos no se renderizan.

## 7. Identidad cashier segura

Para `cashier`, el servicio no solicita el email Auth. La identidad pura usa:

- `profile.full_name` o `Cuenta de caja`;
- `<login_username>@<cashier_login_code>` cuando ambos existen;
- `Alias de caja no disponible` cuando faltan campos;
- label `Cajero`.

El helper descarta cualquier email Auth recibido para rol cashier. Ninguna identidad Auth interna se incorpora a resultado, query cache, contexto, UI, logs, errores, tests o este checkpoint.

## 8. Contexto de negocio actual

`features/membership/providers/current-business-provider.tsx` recibe el objeto ya reducido de una resolución única:

```text
membershipId
businessId
role
roleLabel
businessName
safeDisplayName
safeDisplayIdentifier
```

El provider es delgado y sólo envuelve el shell resuelto. No duplica registros Supabase, sesión, tokens ni campos unidos sin procesar.

## 9. Estados del shell

`features/membership/components/membership-shell.tsx` presenta:

- loading: búsqueda del negocio activo;
- resolved: negocio, identidad segura, badge Owner/Cajero, `Caja lista` y logout;
- no active: mensaje seguro, retry y logout;
- multiple active: bloqueo explícito, retry y logout;
- error: mensaje recuperable sin texto Supabase, retry y logout.

El shell no incluye sidebar, métricas, administración, scanner, QR, actividad ni operaciones de lealtad.

## 10. Pruebas

`features/membership/domain/membership-resolution.test.ts` cubre resolución única, cero, múltiples y rol inesperado.

`features/membership/domain/display-identity.test.ts` cubre email owner permitido, alias cashier público, descarte del email Auth, fallbacks cashier y rol inesperado.

Resultado global: 5 archivos y 23 tests PASS.

## 11. Validación

- `pnpm test`: PASS — 5 archivos, 23 tests.
- `pnpm lint`: PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS.
- `git diff --check`: PASS.
- Smoke `/caja` sin sesión: PASS — HTTP 307 a `/login`.
- Smoke `/login`: PASS — HTTP 200.

No se automatizó login real ni se consultó/mutó estado hospedado con credenciales de usuario.

## 12. Siguiente bloque recomendado

```text
Caja Web — QR Acquisition & Scan Lookup v1
```

Ese bloque implementará adquisición QR en navegador y `scan-loyalty-account`. No debe incorporar todavía earn, redeem o activity.
