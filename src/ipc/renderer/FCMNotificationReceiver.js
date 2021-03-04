const { EventEmitter } = require('events');

/**
 * This class is responsible for communicating with the FCMNotificationManager running
 * in the main process.
 *
 * Events are sent from here in the renderer process via ipc to the main process,
 * and results are then sent back to the renderer process via ipc.
 */
class FCMNotificationReceiver extends EventEmitter {

    constructor(ipcRenderer) {

        super();

        // global vars
        this.ipcRenderer = ipcRenderer;

        // register ipc channel handlers
        ipcRenderer.on('push-receiver.register.success', (event, data) => this.onRegisterSuccess(event, data));
        ipcRenderer.on('push-receiver.register.error', (event, data) => this.onRegisterError(event, data));
        ipcRenderer.on('push-receiver.notifications.listen.started', (event, data) => this.onNotificationListenStarted(event, data));
        ipcRenderer.on('push-receiver.notifications.listen.stopped', (event, data) => this.onNotificationListenStopped(event, data));
        ipcRenderer.on('push-receiver.notifications.received', (event, data) => this.onNotificationReceived(event, data));
        ipcRenderer.on('push-receiver.notifications.error', (event, data) => this.onNotificationError(event, data));

    }

    onRegisterSuccess(event, data) {
        this.emit('register.success', data);
    }

    onRegisterError(event, data) {
        this.emit('register.error', data);
    }

    onNotificationListenStarted(event) {
        this.emit('notifications.listen.started');
    }

    onNotificationListenStopped(event) {
        this.emit('notifications.listen.stopped');
    }

    onNotificationReceived(event, data) {
        this.emit('notifications.received', data);
    }

    onNotificationError(event, data) {
        this.emit('notifications.error', data);
    }

    /**
     * Ask the main process to register a new android device
     * to receive fcm notifications for the provided senderId.
     *
     * Events Emitted:
     * - register.success
     * - register.error
     */
    register(senderId) {
        ipcRenderer.send('push-receiver.register', {
            senderId: senderId,
        });
    }

    /**
     * Ask the main process to start listening for notification via fcm.
     * When notifications are received, the notifications.received event is emitted.
     *
     * Events Emitted:
     * - notifications.listen.started
     * - notifications.received
     * - notifications.error
     */
    startListeningForNotifications(credentials, persistentIds) {
        ipcRenderer.send('push-receiver.notifications.listen.start', {
            credentials: credentials,
            persistentIds: persistentIds,
        });
    }

    /**
     * Ask the main process to stop listening for notifications via fcm.
     *
     * Events Emitted:
     * - notifications.listen.stopped
     */
    stopListeningForNotifications() {
        ipcRenderer.send('push-receiver.notifications.listen.stop');
    }

}

module.exports = FCMNotificationReceiver;