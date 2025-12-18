# 🔐 Admin Panel Quick Reference

## Login Credentials
- **Username:** `admin`
- **Password:** `admin123`

## How to Access Admin Panel

### Method 1: From Home Page (Recommended)
1. Go to `index.html`
2. Look at the top-right corner of the header
3. Click the blue **"Admin Login"** button
4. Enter username and password
5. Click **"Kirish"** (Login)
6. After login, the button changes to **"Admin Panel"** - click it to go to the admin page
7. To logout, click **"Chiqish"** (Logout)

### Method 2: Direct Navigation
- Go directly to `admin.html`
- You'll see the login form if not logged in
- Enter credentials and click **"Kirish"**
- Admin panel will display

## Admin Panel Features

### 1. **Manage Genres**
- Add custom anime genres
- Delete existing genres
- Located at the top of the admin panel

**Steps:**
1. Type genre name in the input field
2. Click **"Qo'shish"** (Add) button
3. Genre appears in the list with a delete button

### 2. **Add New Anime**
- Fill in all anime details
- All fields are required for proper display

**Steps:**
1. Enter anime name
2. Write anime description
3. Add genres (comma-separated)
4. Paste poster image URL
5. Select status (Yangi, Davom etmoqda, Tugallangan)
6. Enter rating (1-10)
7. Add Telegram channel link
8. Click **"Qo'shish"** (Add) button

### 3. **Edit Anime**
- Click the blue **"Tahrirlash"** (Edit) button on any anime in the list
- Modal opens with current data
- Make changes and click **"Saqlash"** (Save)

### 4. **Delete Anime**
- Click the red **"O'chirish"** (Delete) button on any anime
- Anime is permanently removed
- Confirmation dialog will appear

---

## Default Demo Anime

The system comes with 10 pre-loaded anime:
1. Naruto Shippuden
2. Death Note
3. Attack on Titan
4. Dragon Ball Z
5. Demon Slayer
6. My Hero Academia
7. Sword Art Online
8. One Piece
9. Hunter x Hunter
10. Jujutsu Kaisen
11. Tokyo Ghoul
12. Mob Psycho 100
13. Ergo Proxy

**You can:**
- Edit any of these entries
- Delete them to add your own
- Add completely new anime

---

## Important Notes

✅ **All changes are saved automatically to localStorage**
✅ **Data persists even after closing the browser**
⚠️ **Admin session is temporary - resets when you close the browser**
⚠️ **Never share admin credentials publicly**

## Troubleshooting

**Q: Admin login button not working?**
- A: Make sure you're on `index.html` first
- Clear browser cache and reload
- Try direct access: `admin.html`

**Q: Can't see the admin panel after login?**
- A: Check browser console for errors (F12)
- Make sure localStorage is enabled
- Try logging out and logging back in

**Q: Changes not being saved?**
- A: Check if localStorage is enabled in your browser
- Try a different browser
- Check browser storage limit

---

**Last Updated:** Current Session
**Version:** 1.0
