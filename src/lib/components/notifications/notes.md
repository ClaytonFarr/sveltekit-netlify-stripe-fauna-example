# Notifications Component & Store

1. Within route(s) - or parent layout(s) - where want display notifications import component; e.g. -

   - import Notification from '$lib/components/Notification/index.svelte'
   - <Notification />
     - can be placed anywhere within markup and will display correctly
     - can be configured; see options exported from component

2. Within route or component, import notifications store; e.g. -

   - import { notifications } from '$lib/components/Notification/store.js'

3. Within route or component, define notifications inline or in handlers; e.g. -

   - const notification1 = () => { notifications.success({ message: 'Success' }); }
   - const notification2 = () => { notifications.warning({ message: 'Please Wait', detail: 'Retrieving information…', secondsDisplayed: 3 }); }

   - notifications can be created with 1 of 5 methods: .default, .info, .success, .warning, .danger (updates icon and style used)
   - message: required, primary message in notification
   - detail: optional detail message displayed in notification
   - dismissable: optional, allows user to dismiss notification before timeout; defaults to true
   - secondsDisplayed: optional, # of seconds to display notification; defaults to 5 seconds

4. Call notifications as needed via user or system events; e.g. -

   - <button on:click='{notification1}'>Success</button>
   - <button on:click='{notification2}'>Warn</button>
