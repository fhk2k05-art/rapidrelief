# 🚨 RapidRelief – Smart Emergency Response System

RapidRelief is a real-time emergency assistance platform designed to provide **instant help during critical situations**.
It connects users to **nearest emergency services and nearby volunteers within 5km**, improving response time before official help arrives.

---

## 🌟 Features

### 🚑 Smart Emergency Navigation

* Medical → Nearest hospital
* Fire → Nearest fire station
* Crime → Nearest police station
* Mechanical → Nearest repair service
* One-click navigation using Google Maps

---

### 👥 Nearby People Help (5KM Radius)

* Detects users within 5km radius
* Displays nearby helpers on map
* Enables faster community-based assistance

---

### 🚨 SOS + Auto Alert System

* Sends SOS signal with live location
* Automatically alerts nearby users
* Shows number of people notified

---

### 📡 Live Location Tracking

* Tracks user location in real-time
* Stores movement data in backend
* Useful for monitoring during emergencies

---

### 🗺️ Interactive Map System

* Built using Leaflet.js
* Displays:

  * User location
  * Nearby services
  * Nearby helpers

---

### 🔐 Authentication System

* User login & registration
* Session-based authentication
* Admin access control

---

### 🛠️ Admin Dashboard APIs

* View users
* Monitor SOS requests
* Track user movement
* Analyze emergency categories

---

## 🏗️ Tech Stack

**Frontend**

* HTML, CSS, JavaScript
* Leaflet.js (Maps)

**Backend**

* Node.js
* Express.js

**Database (Local JSON)**

* users.json
* sos.json
* track.json
* category.json

---

## 📁 Project Structure

```
RapidRelief/
│── server.js
│── rr.html
│── login.html
│── admin.html
│── users.json
│── sos.json
│── track.json
│── category.json
│── assets/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/rapidrelief.git
cd rapidrelief
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run Server

```bash
node server.js
```

### 4️⃣ Open in Browser

```
http://localhost:3000
```

---

## 🚀 How It Works

1. User logs in
2. Selects emergency type
3. Clicks **Call / SOS**
4. System:

   * Finds nearest service
   * Alerts nearby users
   * Tracks location
5. Admin monitors activity in real-time

---

## 🔥 Future Enhancements

* 📡 Real-time WebSocket tracking
* 🔔 Push notifications
* 📱 Android APK version
* 🧠 AI-based emergency prioritization
* 📍 Offline SMS fallback system

---

## 🤝 Contribution

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Inspiration

Built to reduce emergency response time by combining:

* Technology
* Community support
* Real-time data

---

## 👨‍💻 Author

FADIL H

---

⭐ If you like this project, give it a star!
