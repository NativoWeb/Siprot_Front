import { createApp } from "vue"
import App from "./App.vue"
import router from "./router/index"
import NotificationPlugin from "./plugins/notifications.js"

const app = createApp(App)

app.use(router)
app.use(NotificationPlugin)
app.mount("#app")
