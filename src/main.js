import { createApp } from "vue"
import App from "./App.vue"
import router from "./router/index"
import NotificationPlugin from "./plugins/notifications.js"
import { startTokenValidation } from "./utils/tokenValidation.js"


const app = createApp(App)

app.use(router)
app.use(NotificationPlugin)
app.use(startTokenValidation)
app.mount("#app")
