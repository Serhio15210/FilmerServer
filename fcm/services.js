const UserModel = require("../models/User");
const LastMovieModel = require("../models/LastMovie");
const axios = require("axios");

const {firebaseInit} = require("./index");

const NotificationModel = require("../models/Notification");

const sendPushNotification = async (registrationToken, notificationData) => {
    const message = {
        notification: notificationData,
        token: registrationToken,
    };
    try {
        console.log('message', message)
        const response = await firebaseInit.messaging().send(message)
        // console.log(`FCM message sent with response: ${response}`);

    } catch (error) {
        console.error(`Error sending FCM message: ${error}`);
    }
}
const getLastSavedMovieId = async () => {
    try {

        const lastSavedMovie = await LastMovieModel.findOne();
        // console.log(lastSavedMovie)
        return lastSavedMovie ? lastSavedMovie.imdb_id : null;
    } catch (error) {
        console.error('Помилка при отриманні останнього збереженого фільму:', error.message);
    }
}

async function fetchAndSaveNewMovies() {
    let lastSavedMovieId = await getLastSavedMovieId();
    const response = await axios.get('https://api.themoviedb.org/3/movie/upcoming', {
        params: {
            api_key: process.env.API_KEY,
            language: 'uk-UA',
            page: 1,
        },
    });
    const movie = response.data.results[0];

    if (lastSavedMovieId !== null) {

        if (lastSavedMovieId !== movie?.id + '') {
            const newSavedMovie = await LastMovieModel.updateOne({}, {$set: {imdb_id: movie?.id}}, {upsert: true});
            const users = await UserModel.find();

            // Создаем массив промисов для функции sendPushNotification
            const sendNotifications = users.map(async item => {
                if (item?.fcmToken) {
                    await sendPushNotification(item.fcmToken, {
                        title: 'Новий фільм на підході!',
                        body: `"${movie.title}" доданий до 'Скоро у кіно'`,
                    });
                }
            });

            // Ожидаем завершения всех промисов
            await Promise.all(sendNotifications);
        }
    } else {
        const newSavedMovie = await LastMovieModel.updateOne({}, {$set: {imdb_id: movie?.id}}, {upsert: true});
    }
};
const deleteOldNotificationsJob = async () => {
    try {

        const currentDate = new Date();

        const oneDayAgo = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000);
        const deletedNotifications = await NotificationModel.find({createdAt: {$lt: oneDayAgo}});
        await NotificationModel.deleteMany({createdAt: {$lt: oneDayAgo}}, {isDeleted: true});

        const deletedNotificationIds = deletedNotifications.map(notification => notification._id);
        await UserModel.updateMany({}, {$pull: {notifications: {_id: {$in: deletedNotificationIds}}}});
        console.log('Старые уведомления успешно удалены');
    } catch (error) {
        console.error('Ошибка при удалении старых уведомлений:', error);
    }
}
const startMovieMonitoring = () => {
    fetchAndSaveNewMovies(); // Виклик функції один раз при запуску

    // Періодичний виклик функції кожні 24 години (за необхідністю можна змінити інтервал)
    setInterval(fetchAndSaveNewMovies, 12 * 60 * 60 * 1000);
}
const deleteOldNotifications = () => {
    deleteOldNotificationsJob(); // Виклик функції один раз при запуску

    // Періодичний виклик функції кожні 24 години (за необхідністю можна змінити інтервал)
    setInterval(fetchAndSaveNewMovies, 12 * 5 * 60 * 60 * 1000);
}
module.exports = {sendPushNotification, startMovieMonitoring, deleteOldNotifications}
