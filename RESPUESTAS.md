# TP N° 3: Permisos móviles en Android, iOS y Expo

**Alumno:** Giuricich, Facundo
**Materia:** Taller Complementario – React Native II

---

## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a)** Un permiso es una autorización que la persona le da a una app para que pueda usar algo protegido del teléfono, como la cámara, la ubicación, los contactos o el micrófono. Hay tres actores:
- **La app** declara qué permisos podría necesitar y los pide cuando los va a usar.
- **El sistema operativo** controla todo: muestra el diálogo, guarda la respuesta y bloquea el acceso si no hay permiso.
- **La persona usuaria** es la que decide si acepta o no, y puede cambiar de idea después desde Ajustes.

**b)** La caja de arena (sandbox) es el "encierro" en el que corre cada app: tiene sus propios archivos y su propio proceso, y no puede ver lo de otras apps ni tocar el hardware sensible por su cuenta. Los permisos son las puertas controladas para salir de esa caja y acceder a algo de afuera. Sin ningún permiso una app igual puede hacer bastante: mostrar pantallas, hacer cálculos, guardar datos en su propio almacenamiento, vibrar, y en Android usar internet (que es de instalación). También puede usar herramientas del sistema como el selector de fotos, donde la persona elige qué compartir.

**c)** Las cuatro razones:
1. **Privacidad:** proteger datos personales. Ejemplo: la ubicación permite saber dónde vivís o trabajás.
2. **Seguridad:** evitar que una app maliciosa haga cosas a escondidas. Ejemplo: grabar audio con el micrófono sin que te enteres.
3. **Control y consentimiento:** que la persona decida y sepa qué usa cada app. Ejemplo: elegir si una red social puede ver tus contactos.
4. **Cuidado de recursos:** batería y datos. Ejemplo: la ubicación en segundo plano gasta mucha batería, por eso es un permiso aparte.

**d)** La **visita** es la app, el **portero** es el sistema operativo y el **dueño del departamento** es la persona usuaria. Cuando la visita quiere entrar, el portero llama al dueño y le pregunta. Que "el portero se acuerda de la respuesta" quiere decir que el sistema guarda la decisión: si el dueño dijo que sí, la próxima vez deja pasar sin preguntar; y si dijo que no varias veces, ya ni siquiera lo llama (no aparece más el diálogo) hasta que el dueño cambie la decisión desde Ajustes.

### A2. Declarar y solicitar

| | Declarar (al compilar) | Solicitar (al ejecutar) |
|---|---|---|
| **¿Qué se hace?** | Se avisa en la configuración de la app qué permisos podría usar. Queda guardado dentro del binario. | Cuando se va a usar el recurso, se le pide al sistema que muestre el diálogo y se lee la respuesta. |
| **¿Dónde / cómo en Android?** | En el `AndroidManifest.xml` con `<uses-permission android:name="android.permission.CAMERA" />`. | Con `requestPermissions()` en tiempo de ejecución (solo para los permisos peligrosos, los de instalación no se piden). |
| **¿Dónde / cómo en iOS?** | En el `Info.plist`, con la clave del recurso y su texto de propósito (ej. `NSCameraUsageDescription`). | Llamando a la API del framework, por ejemplo `AVCaptureDevice.requestAccess` o `requestWhenInUseAuthorization`. |
| **¿Dónde / cómo en Expo?** | En `app.json` (o `app.config.ts`): plugins de cada módulo, `ios.infoPlist`, `android.permissions` y `android.blockedPermissions`. `npx expo prebuild` genera los archivos nativos. | Con las funciones de cada módulo: `request...PermissionsAsync()` o los hooks `use...Permissions()`. |
| **¿Qué pasa si se omite?** | Android: el pedido se deniega directo, sin diálogo. iOS: la app se cierra (crash) al acceder al recurso y App Store rechaza la build. | Si el permiso es de tiempo de ejecución y nunca se pide, la función falla (por ejemplo la cámara no abre) porque el sistema no da acceso. |

### A3. Verdadero o falso

- **a) F.** El diálogo lo dibuja el sistema operativo, no la app. La app solo lo dispara (antes puede mostrar su propia pantalla previa, pero el diálogo es del sistema).
- **b) V.**
- **c) F.** El `Info.plist` es parte del código nativo, así que cualquier cambio necesita una build nueva y pasar otra vez por la tienda. Una actualización OTA solo cambia el JavaScript y los assets.
- **d) F.** Si el permiso no está en el manifiesto, Android no muestra nada y lo deniega directamente.
- **e) F.** `expo-permissions` está deprecado y ya no se usa. Ahora cada módulo trae sus propias funciones de permisos (por ejemplo `Location.requestForegroundPermissionsAsync()`).
- **f) V.** Las notificaciones no tienen clave en el `Info.plist`, el texto del diálogo lo arma el sistema.
- **g) V.** Con acceso limitado el `status` es `'granted'`, y lo que indica que es parcial es `accessPrivileges: 'limited'`.
- **h) V.** Es lo que recomienda la documentación de Expo, porque al desinstalar se borra la decisión guardada. Igual hay formas más rápidas sin reinstalar (ver D6 d).

### A4. Los estados de un permiso

**a)** Diagrama:

```
ANDROID (11+)
Sin decidir --Permitir--> Concedido
Sin decidir --No permitir--> Denegado (se puede volver a pedir)
Denegado --No permitir otra vez--> Bloqueado (no vuelve a preguntar)
Sin decidir --Solo esta vez--> Concedido temporal --al salir de la app--> se pierde
Cualquier estado --Ajustes--> Concedido / Denegado

iOS
Sin decidir --Permitir--> Concedido
Sin decidir --No permitir--> Denegado = Bloqueado (no hay segunda vez)
Cualquier estado --Ajustes--> Concedido / Denegado
```

La diferencia central es que **Android da dos oportunidades** para preguntar (recién después del segundo "No" queda bloqueado), mientras que **iOS pregunta una sola vez**: si la persona dice que no, ya no se puede volver a mostrar el diálogo y solo queda mandarla a Ajustes.

**b)**

| Estado | status | canAskAgain | ¿Puede aparecer el diálogo? |
|---|---|---|---|
| Sin decidir | `'undetermined'` | `true` | Sí |
| Concedido | `'granted'` | `true` | No (no hace falta) |
| Denegado (se puede volver a pedir) | `'denied'` | `true` | Sí |
| Bloqueado | `'denied'` | `false` | No |

---

## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificá los permisos

| Permiso | Tipo | ¿Cómo se obtiene? |
|---|---|---|
| INTERNET | De instalación | Se concede solo al instalar si está en el manifiesto. |
| CAMERA | De tiempo de ejecución | Se declara y después se pide con el diálogo. |
| VIBRATE | De instalación | Se concede solo al instalar. |
| SYSTEM_ALERT_WINDOW | Especial | La persona lo activa en Ajustes ("Mostrar sobre otras apps"); la app abre esa pantalla. |
| POST_NOTIFICATIONS | De tiempo de ejecución (Android 13+) | Se declara y se pide con el diálogo. |
| ACCESS_NETWORK_STATE | De instalación | Se concede solo al instalar. |
| READ_CONTACTS | De tiempo de ejecución | Se declara y se pide con el diálogo. |
| SCHEDULE_EXACT_ALARM | Especial | La persona lo habilita en Ajustes ("Alarmas y recordatorios"); la app la manda a esa pantalla. |
| RECORD_AUDIO | De tiempo de ejecución | Se declara y se pide con el diálogo. |
| MANAGE_EXTERNAL_STORAGE | Especial | Se habilita en Ajustes ("Acceso a todos los archivos"). Google Play lo restringe mucho. |

### B2. Grupos y nombres

**a)** Un grupo de permisos junta permisos relacionados con el mismo recurso (por ejemplo, todo lo de ubicación o todo lo de contactos), y el diálogo se muestra por grupo. Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, la persona ve **un solo diálogo** (en Android 12+ ese diálogo tiene la opción de elegir ubicación precisa o aproximada).

**b)** El prefijo es `android.permission.`. El nombre completo del permiso de cámara es `android.permission.CAMERA`.

**c)** Los permisos de firma (signature) solo se le dan a apps que están firmadas con el mismo certificado que la app que define el permiso (por ejemplo, apps del sistema o del fabricante, o apps del mismo desarrollador que quieren compartir algo entre ellas). Una app común no los puede usar porque no tiene esa firma, así que pedirlos no sirve.

### B3. Leé el manifiesto

**a)** Se concede solo al instalar: **INTERNET**. Hay que pedirlos además en tiempo de ejecución: **CAMERA, ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION, POST_NOTIFICATIONS** (Android 13+) y **READ_EXTERNAL_STORAGE** (solo en Android 12 o anterior). RECORD_AUDIO no cuenta porque se está quitando.

**b)** `android:maxSdkVersion="32"` significa que el permiso solo se declara en dispositivos hasta la API 32 (Android 12L). En Android 13 o más el permiso directamente no existe para la app. Desde Android 13 lo reemplazan **READ_MEDIA_IMAGES**, **READ_MEDIA_VIDEO** y **READ_MEDIA_AUDIO** (y en Android 14 se agrega READ_MEDIA_VISUAL_USER_SELECTED para el acceso parcial).

**c)** `tools:node="remove"` le dice al "merger" de manifiestos que saque ese permiso del manifiesto final, aunque lo declare alguna librería. En app.json se genera así:

```json
{
  "expo": {
    "android": {
      "blockedPermissions": ["android.permission.RECORD_AUDIO"]
    }
  }
}
```

**d)** Va en `android.permissions`:

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"]
    }
  }
}
```

**e)** Porque en Expo la carpeta `android` se genera con `npx expo prebuild` a partir del `app.json` (en SDK 57 prebuild además limpia y regenera las carpetas por defecto). Cualquier cambio a mano se pierde la próxima vez que se genere. La fuente de verdad es el `app.json`.
`blockedPermissions` **no funciona en Expo Go**, porque Expo Go es una app ya compilada con su propio manifiesto. La configuración nativa solo se aplica cuando compilás tu propia app (development build o build de producción).

### B4. Así pregunta Android

**a)** No, en Android no se puede poner texto propio en el diálogo, lo arma el sistema. Para qué se usa el permiso hay que explicarlo **antes**, en una pantalla propia de la app (pantalla previa), y en el momento en que la persona toca la función.

**b)** "Mientras la app está en uso" deja el permiso concedido de forma permanente para cuando la app está abierta. "Solo esta vez" lo da temporalmente: cuando la persona sale de la app, al rato se revoca y la próxima vez hay que preguntar de nuevo. "Solo esta vez" existe para **ubicación, cámara y micrófono** (desde Android 11).

**c)** Si toca "No permitir" dos veces, Android lo toma como "no volver a preguntar": los siguientes `request` ya no muestran el diálogo y devuelven denegado directamente. `canAskAgain` pasa a ser **`false`**.

**d)** Funciona bien: mostrar el clima de tu ciudad o las farmacias de turno de tu zona. No funciona: una app de navegación paso a paso o seguir al repartidor de un delivery, porque con 3 km² de error no sabés ni en qué cuadra estás.

**e)** Android **mata el proceso de la app**. Cuando la persona vuelve, la app se reinicia (intenta restaurar la pantalla donde estaba), así que hay que estar preparado para eso.

### B5. Android, versión por versión

| Cambio | Versión (API) | Qué implica para el código |
|---|---|---|
| Nacen los permisos en tiempo de ejecución | Android 6.0 (API 23) | Ya no alcanza con el manifiesto: hay que consultar y pedir el permiso antes de usar el recurso. |
| La ubicación en segundo plano pasa a ser un permiso aparte | Android 10 (API 29) | Hay que declarar y pedir `ACCESS_BACKGROUND_LOCATION` por separado, y siempre después del de primer plano (en Android 11 se concede desde Ajustes). |
| Dos rechazos equivalen a "no volver a preguntar" | Android 11 (API 30) | Hay que leer `canAskAgain` y, si es `false`, ofrecer "Abrir Ajustes" en vez de volver a pedir. |
| Ubicación precisa o aproximada | Android 12 (API 31) | Pedir FINE y COARSE juntos y revisar qué dio la persona (`accuracy: 'coarse'`); la app tiene que funcionar con la aproximada. |
| Las notificaciones pasan a ser un permiso (POST_NOTIFICATIONS) | Android 13 (API 33) | Hay que pedir el permiso (antes venían permitidas) y crear un canal antes de pedirlo. |
| Acceso parcial a fotos y videos ("Seleccionar fotos") | Android 14 (API 34) | Hay que manejar el acceso limitado, o mejor usar el selector del sistema que no pide permiso. |
| Permiso de red local (ACCESS_LOCAL_NETWORK) | Android 17 (API 37) | Si la app apunta a API 37 y se conecta a dispositivos de la red local, tiene que declararlo y pedirlo en tiempo de ejecución (es del grupo "Dispositivos cercanos"), o usar los selectores del sistema. |

**targetSdkVersion:** es la versión de Android para la que la app está pensada y probada. El sistema le aplica a la app las reglas nuevas de esa versión (por ejemplo, las reglas de Android 17 se aplican recién cuando apuntás a API 37). **Expo SDK 57 apunta a la API 36 (Android 16)**. Desde el **31 de agosto de 2026**, Google Play exige que las apps nuevas y las actualizaciones apunten a **API 36 o superior**.

---

## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| Recurso | Clave en Info.plist |
|---|---|
| Cámara | `NSCameraUsageDescription` |
| Micrófono | `NSMicrophoneUsageDescription` |
| Ubicación en uso | `NSLocationWhenInUseUsageDescription` |
| Ubicación siempre | `NSLocationAlwaysAndWhenInUseUsageDescription` |
| Fotos (leer) | `NSPhotoLibraryUsageDescription` |
| Fotos (solo guardar) | `NSPhotoLibraryAddUsageDescription` |
| Contactos | `NSContactsUsageDescription` |
| Face ID | `NSFaceIDUsageDescription` |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription` |
| Notificaciones | No lleva clave |

### C2. Sin texto, no hay permiso

**a)** Si falta el texto de propósito, la app **se cierra (crash)** apenas intenta usar la cámara. En la consola aparece "This app has crashed because it attempted to access privacy-sensitive data without a usage description". Al subir la build a App Store Connect la rechazan con el error **ITMS-90683** (Missing purpose string in Info.plist).

**b)** iOS muestra el diálogo **una sola vez**. Si la persona dice que no, la app no puede volver a preguntar: lo único que le queda es explicar para qué lo necesita, mandarla a Ajustes (`Linking.openSettings()`) y ofrecer una alternativa.

**c)** El sistema arma el título ("Mantenimiento IPF quiere acceder a la cámara") y los botones. Lo que escribimos nosotros es el texto de propósito que aparece debajo del título. En Expo se configura en `app.json`, en las opciones del plugin de cada módulo (por ejemplo `cameraPermission` en expo-camera) o en `ios.infoPlist`.

**d)** Pasa porque Apple revisa el binario y si encuentra código que usa una API protegida, exige la clave en el `Info.plist`, aunque tu app nunca llame a esa parte. Se resuelve agregando un texto de propósito real para esa clave, o sacando o desactivando esa parte de la librería si no se usa (muchos plugins de Expo tienen una opción para eso).

### C3. Probador de textos de propósito

| Texto propuesto | ¿Aprobado? | Versión mejorada |
|---|---|---|
| "Necesitamos tu ubicación." | No, no dice para qué. | "Usamos tu ubicación para mostrarte las farmacias de turno que tenés más cerca." |
| "Para mejorar tu experiencia." | No, es muy genérico y no dice qué dato usa. | "Usamos tu ubicación para ordenar las farmacias según la distancia a donde estás." |
| "Usamos tu ubicación para mostrarte las farmacias de turno más cercanas." | Sí, dice el dato y el beneficio concreto. | Está bien así. |
| "La app no funciona sin ubicación." | No, no explica nada, presiona a la persona y además la app debería tener una alternativa. | "Usamos tu ubicación para calcular cuánto te falta para llegar a la farmacia que elegiste." |
| "Ubicación requerida por el sistema." | No, es falso (lo pide la app, no el sistema) y no tiene beneficio. | "Usamos tu ubicación para avisarte qué farmacias de tu barrio están abiertas ahora." |

### C4. Acceso parcial y gradual

| Caso | iOS | En Expo |
|---|---|---|
| Fotos limitadas ("Seleccionar fotos") | iOS 14 | `accessPrivileges === 'limited'` en la respuesta del permiso de fotos (expo-media-library / expo-image-picker). |
| Ubicación aproximada (interruptor "Precisa") | iOS 14 | `ios.accuracy === 'reduced'` en la respuesta de `getForegroundPermissionsAsync()`. |
| "Permitir una vez" (ubicación) | iOS 13 | Mientras la app está abierta devuelve `'granted'`; al cerrar y volver a abrir, el estado vuelve a `'undetermined'`. |
| Ubicación escalonada: de "al usar la app" a "Siempre" | iOS 13 | Primero `requestForegroundPermissionsAsync()` y después `requestBackgroundPermissionsAsync()`; se ve en `ios.scope` (`'whenInUse'` o `'always'`). |
| Notificaciones provisionales | iOS 12 | `Notifications.requestPermissionsAsync({ ios: { allowProvisional: true } })` y se detecta con `ios.status === IosAuthorizationStatus.PROVISIONAL`. |
| Rastreo entre apps (App Tracking Transparency) | iOS 14.5 | expo-tracking-transparency: `requestTrackingPermissionsAsync()` o `useTrackingPermissions()`. |

Expo SDK 57 requiere como mínimo **iOS 16.4**. En la práctica, todos los casos de la tabla siempre pueden aparecer en cualquier iPhone donde corra la app. No hace falta código para iOS viejos, pero sí hay que manejar siempre el acceso limitado, la ubicación aproximada, etc.

### C5. Android vs iOS, lado a lado

| | Android | iOS |
|---|---|---|
| **¿Dónde se declara?** | `AndroidManifest.xml` (`<uses-permission>`) | `Info.plist` (claves `NS...UsageDescription`) |
| **Texto en el diálogo** | No se puede, lo arma el sistema | Sí, el texto de propósito es obligatorio |
| **Oportunidades para preguntar** | Dos (desde Android 11) | Una |
| **"Solo esta vez" / "Permitir una vez"** | Desde Android 11, para ubicación, cámara y micrófono | Desde iOS 13, solo para ubicación |
| **Notificaciones** | Permiso de tiempo de ejecución desde Android 13 (antes venían permitidas) y necesitan canal | Siempre se piden; no llevan texto en Info.plist; existe la opción provisional |
| **Ubicación en segundo plano** | Permiso aparte (`ACCESS_BACKGROUND_LOCATION`), se pide después del de primer plano y se da en Ajustes ("Permitir todo el tiempo") | Escalonado: primero "al usar la app" y después "Siempre"; necesita su clave y el modo background |
| **Si falta la declaración** | No aparece el diálogo, se deniega directo | La app se cierra al acceder y App Store rechaza la build |

---

## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| Necesidad | Módulo | Hook / función de permiso |
|---|---|---|
| Escanear un QR con la cámara | expo-camera | `useCameraPermissions()` |
| Grabar video con sonido | expo-camera | `useCameraPermissions()` + `useMicrophonePermissions()` |
| Mostrar farmacias cercanas | expo-location | `useForegroundPermissions()` / `requestForegroundPermissionsAsync()` |
| Seguir un envío con la app en segundo plano | expo-location (+ expo-task-manager) | `requestForegroundPermissionsAsync()` y después `requestBackgroundPermissionsAsync()` |
| Mostrar un recordatorio | expo-notifications | `requestPermissionsAsync()` / `getPermissionsAsync()` |
| Grabar una nota de voz | expo-audio | `requestRecordingPermissionsAsync()` |
| Galería propia dentro de la app | expo-media-library | `MediaLibrary.usePermissions()` / `requestPermissionsAsync()` |
| Publicidad personalizada entre apps (iOS) | expo-tracking-transparency | `useTrackingPermissions()` / `requestTrackingPermissionsAsync()` |

Si un tutorial usa `import * as Permissions from 'expo-permissions'`, es **un tutorial viejo**. Ese paquete está deprecado y ya no se usa, así que probablemente el resto del tutorial también está desactualizado. Hoy cada módulo trae sus propias funciones de permisos.

### D2. Consultar, pedir y el hook

**a)** `get...PermissionsAsync()` solo **consulta** cómo está el permiso y nunca muestra nada. `request...PermissionsAsync()` **pide** el permiso: si todavía se puede preguntar muestra el diálogo, y si ya está concedido o bloqueado devuelve la respuesta directamente. El único que puede mostrar un diálogo es **request**.

**b)** Los tres elementos son:
- `permiso`: la respuesta actual (estado, granted, canAskAgain…).
- `pedirPermiso`: función que llama al request (puede mostrar el diálogo).
- `consultarPermiso`: función que vuelve a consultar (get) para actualizar el estado.

En el primer render `permiso` vale **`null`**, porque la consulta es asíncrona. Mientras tanto la pantalla tiene que mostrar un **indicador de carga**, no la cámara ni el mensaje de denegado.

**c)** Si `canAskAgain` es `false`, llamar a `request...()` devuelve enseguida `denied` **sin mostrar ningún diálogo**. Si se llama en un bucle (por ejemplo en cada render), queda en un loop infinito: la pantalla se queda en "Pidiendo permiso…" para siempre, se re-renderiza todo el tiempo y no aparece nada.

### D3. Leé la respuesta

| Respuesta | Qué hace la app |
|---|---|
| `null` | Todavía está consultando: muestra un indicador de carga. |
| `{ status: 'granted', granted: true }` | Usa la función directamente (muestra la cámara, toma la ubicación, etc.). |
| `{ status: 'undetermined', canAskAgain: true }` | Nunca se preguntó: muestra la pantalla previa con "Continuar", que llama al request. |
| `{ status: 'denied', canAskAgain: true }` | Dijo que no pero se puede volver a pedir: ofrece la alternativa y, si la persona vuelve a tocar la función, explica de nuevo con "Continuar". |
| `{ status: 'denied', canAskAgain: false }` | Está bloqueado: explica cómo habilitarlo, muestra "Abrir Ajustes" y deja usar la alternativa. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Funciona solo con las fotos que eligió: muestra esas y ofrece agregar más o cambiarlo en Ajustes. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Funciona con ubicación aproximada: no muestra coordenadas exactas y usa solo cosas que anden con esa precisión. |

Los dos campos que deciden casi todo son:
- **`granted`/`status`**: responde "¿tengo permiso ahora?".
- **`canAskAgain`**: responde "¿puedo volver a mostrar el diálogo?".

### D4. Simulación del ciclo completo

Android 14, app recién instalada:

| # | Acción | status | canAskAgain | ¿Diálogo? |
|---|---|---|---|---|
| 1 | `getForegroundPermissionsAsync()` | undetermined | true | No |
| 2 | `requestForegroundPermissionsAsync()` → "No permitir" | denied | true | Sí |
| 3 | `requestForegroundPermissionsAsync()` → "No permitir" | denied | false | Sí |
| 4 | `requestForegroundPermissionsAsync()` | denied | false | No |
| 5 | `Linking.openSettings()` → habilita "Mientras la app está en uso" → vuelve y la app consulta | granted | true | No |
| 6 | Igual que el 5, pero la app no vuelve a consultar: ¿qué muestra? | denied (valor viejo) | false (valor viejo) | No |

En el paso 6 la app sigue mostrando "bloqueado", aunque en realidad el permiso ya está concedido, porque se quedó con la última respuesta que tenía guardada.

**En iOS** el resultado cambia en el **paso 2**: después del primer "No permitir" queda `denied` con `canAskAgain: false`, porque iOS pregunta una sola vez. Entonces en los pasos 3 y 4 ya no aparece ningún diálogo y devuelve `denied` / `false` directamente.

Si la persona elige **"Permitir una vez"** y después cierra y reabre la app, el permiso vuelve a **"sin decidir"** (`undetermined`, `canAskAgain: true`) y se le puede volver a preguntar.

### D5. Configurar app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Usamos tu cámara para leer el código QR del contenedor de reciclaje.",
          "microphonePermission": false,
          "recordAudioAndroid": false
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje más cercanos.",
          "locationAlwaysAndWhenInUsePermission": false,
          "isAndroidBackgroundLocationEnabled": false,
          "isIosBackgroundLocationEnabled": false
        }
      ]
    ],
    "android": {
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.SYSTEM_ALERT_WINDOW"
      ]
    }
  }
}
```

`expo-camera` agrega `RECORD_AUDIO` en Android por defecto porque la librería también sirve para grabar video con sonido (`recordAsync`). Como no sabe si la vas a usar para eso, lo declara "por las dudas". Por eso hay que poner `recordAudioAndroid: false` (y bloquearlo) si la app solo lee QR.

### D6. Expo Go no es tu app

**a)** Porque Expo Go es otra app, ya compilada, con su propio `Info.plist` y sus textos genéricos. Mi `app.json` no cambia el binario de Expo Go: los textos de propósito se aplican recién cuando se compila mi propia app.

**b)**
- **En Expo Go se puede probar:** cámara, ubicación en primer plano, selector de imágenes y notificaciones locales.
- **Necesita una development build:** las notificaciones push en Android (Expo Go ya no las soporta), la ubicación en segundo plano, ver mis textos de propósito, probar `blockedPermissions` y usar librerías nativas que no vienen en Expo Go.

**c)**
```bash
# ver los archivos nativos generados
npx expo prebuild --clean

# development build en Android
npx expo install expo-dev-client
npx expo run:android
# o en la nube con EAS:
eas build --profile development --platform android
```

**d)**
```bash
# Android (adb): quitar el permiso y las marcas de "ya decidió"
adb shell pm revoke com.giuricich.mantenimientoipf android.permission.CAMERA
adb shell pm clear-permission-flags com.giuricich.mantenimientoipf android.permission.CAMERA user-set user-fixed

# Simulador de iOS (xcrun simctl)
xcrun simctl privacy booted reset camera com.giuricich.mantenimientoipf
# o todos los permisos de la app:
xcrun simctl privacy booted reset all com.giuricich.mantenimientoipf
```

---

## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

Problemas que encontré:
1. **`permiso` es `null` en el primer render**, entonces `permiso.status` tira error (`Cannot read property 'status' of null`). Falta el estado de carga.
2. **No maneja el estado bloqueado.** Si `canAskAgain` es `false`, el botón llama al request pero no aparece ningún diálogo, y la persona queda trabada tocando un botón que no hace nada. Tiene que mostrar "Abrir Ajustes".
3. **El botón dice "Permitir"** y tendría que decir "Continuar", porque el que da el permiso es el diálogo del sistema que viene después.
4. **`Explicacion` no está importado** en ningún lado.
5. **No hay alternativa** si la persona no da el permiso (por ejemplo, escribir el código a mano).
6. **No se actualiza al volver de Ajustes.**
7. **`CameraView` no tiene configurado el lector de QR** (`barcodeScannerSettings` y `onBarcodeScanned`), así que muestra la cámara pero no lee nada.

Versión corregida:

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { ActivityIndicator, Button, Linking, TextInput } from 'react-native';
import { useRevisarAlVolver } from '../hooks/useRevisarAlVolver';
import { Explicacion } from '../components/Explicacion';

export default function Escanear() {
  const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();
  const [codigo, setCodigo] = useState('');
  useRevisarAlVolver(consultarPermiso); // por si vuelve de Ajustes

  // alternativa: escribir el código del aula a mano
  const aMano = (
    <>
      <TextInput value={codigo} onChangeText={setCodigo} placeholder="O escribí el código del aula" />
      <Button title="Usar este código" onPress={() => console.log('Aula:', codigo)} />
    </>
  );

  // 1. cargando
  if (!permiso) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  // 2. concedido
  if (permiso.granted) {
    return (
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => console.log('QR leído:', data)}
      />
    );
  }

  // 3. preguntable
  if (permiso.canAskAgain) {
    return (
      <Explicacion texto="Usamos la cámara para leer el QR del aula.">
        <Button title="Continuar" onPress={pedirPermiso} />
        {aMano}
      </Explicacion>
    );
  }

  // 4. bloqueado
  return (
    <Explicacion texto="La cámara está bloqueada. Podés habilitarla desde Ajustes o escribir el código a mano.">
      <Button title="Abrir Ajustes" onPress={() => Linking.openSettings()} />
      {aMano}
    </Explicacion>
  );
}
```

### E2. El orden importa (ubicación)

**a)** Está al revés: pide primero la ubicación en segundo plano y después la de primer plano. Siempre hay que pedir primero "en uso" y después "siempre".
- **En iOS** no se puede saltar directo a "Siempre": el sistema primero ofrece "al usar la app" y el "Siempre" viene después, escalonado. Así como está, no se obtiene el alcance que se quería.
- **En Android 11+** pedir `ACCESS_BACKGROUND_LOCATION` sin tener antes el de primer plano no muestra ningún diálogo y se deniega directo. Encima, como el `if` corta ahí, nunca llega a pedir el de primer plano, y la función siempre devuelve `false`.

**b)**
```ts
export async function activarSeguimiento() {
  const enUso = await Location.requestForegroundPermissionsAsync();
  if (!enUso.granted) return false;

  const siempre = await Location.requestBackgroundPermissionsAsync();
  return siempre.granted;
}
```

**c)**
```ts
export async function obtenerUbicacion() {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const pos = await Location.getCurrentPositionAsync({});
    const aproximada =
      permiso.android?.accuracy === 'coarse' || permiso.ios?.accuracy === 'reduced';

    return {
      latitud: pos.coords.latitude,
      longitud: pos.coords.longitude,
      aproximada,
    };
  } catch (error) {
    console.log(error);
    return null; // si falla, no rompe la app
  }
}
```

**d)** No hace falta. "Farmacias cercanas" se usa con la app abierta, así que alcanza con primer plano. Si pedís segundo plano, Google Play te obliga a completar una declaración en Play Console explicando por qué lo necesitás, con un video que lo muestre. La función tiene que ser algo principal y visible de la app, y además hay que mostrar un aviso claro dentro de la app antes de pedirlo. Si no se justifica, la rechazan.

### E3. Notificaciones mudas

**a)** Lo más probable es que **no haya creado ningún canal de notificaciones** antes de pedir. En Android 13+ el diálogo de `POST_NOTIFICATIONS` no aparece si la app no tiene al menos un canal. Antes de pedir el permiso hay que llamar a `Notifications.setNotificationChannelAsync('nombre', {...})`.

**b)** En Android 12 o anterior el permiso no existe: las notificaciones vienen permitidas por defecto y el request devuelve `granted` sin mostrar nada. La persona las puede apagar desde Ajustes.

**c)** Las **notificaciones provisionales** (iOS 12+): llegan en silencio al centro de notificaciones sin preguntar nada. Se piden con `requestPermissionsAsync({ ios: { allowProvisional: true } })` y se detectan con `settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL`.

**d)** Conviene pedirlo cuando la persona hace algo que necesita un aviso.
- **Buen momento:** en una app de turnos, después de sacar un turno, al tocar "Recordarme el turno".
- **Mal momento:** apenas se abre la app por primera vez, antes de que la persona sepa para qué sirve.

### E4. Fotos sin pedir permiso

| Necesidad | Herramienta | Permiso |
|---|---|---|
| Elegir una foto de perfil | `ImagePicker.launchImageLibraryAsync()` (selector del sistema) | Ninguno |
| Sacar una foto en el momento | `ImagePicker.launchCameraAsync()` o expo-camera | Cámara |
| Editor que muestra toda la galería | expo-media-library | Fotos/galería (READ_MEDIA_IMAGES / NSPhotoLibraryUsageDescription), manejando el acceso limitado |
| Adjuntar la foto de un comprobante | `ImagePicker.launchImageLibraryAsync()` (selector del sistema) | Ninguno |

Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO` porque dan acceso a **toda** la galería, que tiene datos muy personales, cuando la mayoría de las apps solo necesitan una foto puntual. Solo las apps cuya función principal es trabajar con la galería (editores, galerías) pueden usarlos, y el resto tiene que usar el selector de fotos. La política se anunció en 2023 y se volvió obligatoria en 2024: las apps con uso puntual tuvieron plazo hasta enero de 2025 para sacar esos permisos.

"El mejor permiso" es **el que no hace falta pedir**: si hay una herramienta del sistema que resuelve lo mismo sin permiso (como el selector de fotos), es mejor usarla.

### E5. Volver de Ajustes

```ts
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current === 'background' || anterior.current === 'inactive';
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
```

**a)** Porque los hooks consultan el permiso cuando se montan y cuando llamás a pedir o consultar, pero no escuchan cambios de afuera. Ajustes es otra app, y no hay ningún evento que le avise a mi app "che, te cambiaron el permiso". Lo único que cambia es que la app vuelve a primer plano, y eso se detecta con `AppState`.

**b)** El tercer elemento del hook, `consultarPermiso` (el que hace get): `const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();` → `useRevisarAlVolver(consultarPermiso)`.

**c)** Porque el permiso lo puede cambiar la persona en cualquier momento desde Ajustes. Además "solo esta vez" se vence solo, y Android puede resetear los permisos de apps que no usás hace mucho. Si lo guardás "para siempre", el valor queda viejo y la app muestra cosas que no son. Hay que consultar al sistema cada vez que se va a usar.

---

## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| App y permiso | ¿Cuándo pedirlo? | Alternativa si lo deniegan |
|---|---|---|
| Delivery · ubicación | Al tocar "Usar mi ubicación" cuando carga la dirección de entrega | Escribir la dirección a mano |
| Billetera virtual · cámara | Al tocar "Pagar con QR" | Ingresar el código o el alias a mano |
| Red social · contactos | Al tocar "Buscar amigos de mis contactos" | Buscar por nombre de usuario o compartir un link de invitación |
| Mensajería · micrófono | La primera vez que mantiene apretado el botón de nota de voz | Mandar mensajes de texto |
| Turnos médicos · notificaciones | Después de sacar un turno, al tocar "Recordarme el turno" | Ver los turnos dentro de la app o recibir el recordatorio por mail |
| Editor de fotos · galería completa | Al entrar a la sección "Mi galería" del editor | Elegir fotos sueltas con el selector del sistema o usar el acceso limitado |

Pedir cuatro permisos apenas se abre la app "entrena el No permitir automático" porque la persona no tiene contexto: no sabe para qué es cada uno y se siente invadida. Entonces aprende a tocar "No" para sacarse los carteles de encima. Y como iOS pregunta una sola vez (y Android dos), esos "no" quedan bloqueados y después cuesta mucho recuperarlos.

### F2. La pantalla previa

**a)** Los tres elementos:
1. El **beneficio en una frase** (para qué se usa el permiso).
2. Un **botón "Continuar"** que lleva al diálogo del sistema.
3. La **aclaración** de que se puede cambiar después desde Ajustes.

**b)** Porque la pantalla previa no da el permiso: el que lo da es el diálogo del sistema que aparece después. Si el botón dice "Permitir", la persona cree que ya aceptó y es confuso (y hasta engañoso). "Continuar" es honesto: solo la lleva al lugar donde realmente decide.

**c)** La pauta 5.1.1(iv) dice que las apps tienen que respetar la decisión de la persona y no manipularla, engañarla ni obligarla a dar permisos. Para la pantalla previa, Apple pide que siempre lleve al diálogo del sistema con un botón tipo "Continuar" o "Siguiente". Poner botones como "Ahora no" o "Cerrar" en esa pantalla hace que la persona esquive o postergue el diálogo, y Apple rechaza la app por eso. La decisión tiene que tomarse en el diálogo del sistema.

**d)** Si el permiso ya está bloqueado, el diálogo no puede aparecer más. Entonces la pantalla cambia:
- explica que está bloqueado;
- dice cómo habilitarlo (el camino en Ajustes);
- el botón pasa a ser **"Abrir Ajustes"** (`Linking.openSettings()`);
- además ofrece la alternativa para seguir sin el permiso.

### F3. Mínimo privilegio

**a)** **Aproximada.** Para mostrar los puntos de reciclaje del barrio no hace falta saber la dirección exacta de la persona, con la zona alcanza.

**b)** **"En uso".** La carrera la empieza la persona con la app abierta, y aunque después guarde el celular en el bolsillo, se puede seguir registrando con un servicio en primer plano en Android (que muestra una notificación fija) y con el indicador de ubicación en iOS. "Siempre" solo haría falta si la app tuviera que empezar a registrar sola sin abrirla.

**c)** **Selector del sistema.** Se sube una sola foto, no hace falta ver toda la galería.

**d)** **Sin micrófono.** Para leer un QR no se graba audio.

### F4. Tiendas

**a)**
- **Google Play:**
  1. Declarar en Play Console el uso de permisos sensibles (ubicación en segundo plano, fotos y videos, todos los archivos, y desde 2027 contactos) con su justificación.
  2. Completar la sección de Seguridad de los datos y tener una política de privacidad publicada (también hay que cumplir el targetSdk mínimo).
- **App Store:**
  1. Tener un texto de propósito en el `Info.plist` para cada API protegida.
  2. Completar las etiquetas de privacidad en App Store Connect e incluir el manifiesto de privacidad (y usar ATT si la app rastrea entre apps).

**b)** El `PrivacyInfo.xcprivacy` es un archivo donde la app (y cada SDK que usa) declara qué datos recolecta, para qué, y por qué usa ciertas APIs que Apple considera sensibles ("required reason APIs", como `UserDefaults` o las fechas de archivos). En Expo se configura en `app.json`, dentro de `ios.privacyManifests`, y prebuild genera el archivo.

**c)** Android 17 suma un **selector de contactos del sistema** (Contact Picker): la persona elige solo los contactos que quiere compartir, sin dar acceso a toda la agenda y sin `READ_CONTACTS`. Desde el **27/01/2027**, las apps que apunten a Android 17 (API 37) o más solo pueden pedir `READ_CONTACTS` si el selector no alcanza para su función principal. Además tienen que presentar una declaración en Play Console justificándolo. Si no, deben sacar el permiso y usar el selector.

### F5. Errores comunes

**a)**
- **Causa:** falta el texto de propósito en el `Info.plist` para el recurso que se usó.
- **Solución:** agregarlo en `app.json` (opción del plugin o `ios.infoPlist`) y hacer una build nueva, porque no se arregla con una OTA.

**b)**
- **Causa:** en Expo Go anda porque Expo Go ya trae todos los permisos declarados en su binario. En la development build el permiso no quedó declarado (falta el plugin de expo-camera en `app.json`, se lo bloqueó en `blockedPermissions`, o no se volvió a compilar después de agregarlo), y Android deniega sin mostrar el diálogo.
- **Solución:** agregar el plugin con su configuración, correr prebuild y recompilar.

**c)**
- **Causa:** la app no vuelve a consultar el permiso cuando vuelve de Ajustes y sigue usando el valor viejo.
- **Solución:** escuchar `AppState` y, cuando la app vuelve a estar activa, llamar a get (el hook `useRevisarAlVolver`). Tampoco hay que guardar el permiso en un store para siempre.

**d)**
- **Causa:** llamar a `request...()` en el cuerpo del componente hace que cada respuesta actualice el estado, eso genera otro render, que vuelve a pedir, y así infinitamente (y si está bloqueado nunca aparece nada).
- **Solución:** pedir solo cuando la persona toca un botón (en el `onPress`), nunca en el render.

**e)**
- **Causa:** la app trata las notificaciones como obligatorias. Va contra la idea de que la app nunca se bloquee por un permiso, y Apple rechaza las apps que exigen permisos que no son necesarios (pauta 5.1.1).
- **Solución:** dejar entrar igual y ofrecer una alternativa (avisos dentro de la app, mail o ver los turnos en la app), y pedir las notificaciones en contexto.
