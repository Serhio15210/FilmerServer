const {validationResult} = require("express-validator");
const UserModel = require("../models/User");
const NotificationModel = require("../models/Notification");

const FilmModel = require("../models/Film");
const {sendPushNotification} = require("../fcm/services");
exports.getNotifications = async (req, res) => {
  try {

    const messages = await UserModel.findOne({ _id: req.userId })
      .sort({ updatedAt: -1 })
      .limit(10).select('notifications').populate('notifications').exec()

    // console.log(messages)
    if (!messages?.notifications.length) {
      return res.status(403).json({
        message: 'Сповіщення не знайдено',
      });
    } else {

      return res.json({
        success: true,
        notifications: messages.notifications,
      });
    }
  } catch (err) {
    console.log(err)
  }
}
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Обновление статуса уведомления в базе данных на прочитано
    const message=await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    )
    console.log(message)
      return res.json({
        success: true

      });

  } catch (err) {
    console.log(err)
  }
}
exports.saveRateNotification = async (userId, film ) => {
  try {
    const user = await UserModel.findOne({_id: userId}).populate('subscribers').exec()
    // console.log(user)
    // sendPushNotification( user.fcmToken, {
    //   title: 'asdasdasdasda',
    //   body: ``,
    // })
    const doc = new NotificationModel({
      title: `${user.userName} оцінив "${film.title}"`,
      text: film.comment,
      rate:film.rate,
      isRead:false,
      userId: userId,
      imdb_id: film.imdb_id,
      isSerial:film.isSerial,
      filmTitle:film.title
    })
    const notification = await doc.save()
    // console.log('notif',notification)
    if (!notification){
      console.log('Notification error')
    }else {

      if (user?.subscribers?.length>0){
        user.subscribers.map(async item => {
          if (item.fcmToken) {
            await sendPushNotification(item.fcmToken, {
              title: notification.title,
              body: notification.text,
            })
            await UserModel.updateOne({_id: item?._id}, {
              $push: {
                notifications: notification._id
              }
            })
          }
          // sendPushNotification( user.fcmToken, {
          //   title: notification.title,
          //   body: ``,
          // })
        })
      }

    }

  } catch (err) {
    console.log(err)
  }
}
exports.saveSubNotification = async (userId, subId ) => {
  try {
    const subUser = await UserModel.findOne({_id: subId})
    const user = await UserModel.findOne({_id: userId})

    const doc = new NotificationModel({
      title: `У вас новий підписник!`,
      text: `${user.userName} підписався(лась) на вас.`,
      isRead:false,

      userId: subId
    })
    const notification = await doc.save()

    if (!notification){
      console.log('Notification error')
    }else {
      if (subUser.fcmToken) {
        await sendPushNotification(subUser.fcmToken, {
          title: notification.title,
          body: notification.text,
        })
        await UserModel.updateOne({_id: subId}, {
          $push: {
            notifications: notification._id
          }
        })
      }
    }

  } catch (err) {
    console.log(err)
  }
}
