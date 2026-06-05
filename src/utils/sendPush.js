// Send push notification via Expo's free push service
const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) return;
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        data,
        sound: "default",
        priority: "high",
      }),
    });
  } catch (e) {
    console.log("Push notification error:", e.message);
  }
};

module.exports = sendPushNotification;
