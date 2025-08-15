// إدارة حالة المصادقة
auth.onAuthStateChanged(user => {
    const signInButton = document.getElementById('signInButton');
    const signOutButton = document.getElementById('signOutButton');
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const postForm = document.getElementById('postForm');

    if (user) {
        // المستخدم مسجل الدخول
        signInButton.style.display = 'none';
        signOutButton.style.display = 'block';
        userProfile.style.display = 'flex';
        
        // عرض معلومات المستخدم
        userAvatar.src = user.photoURL || 'images/default-avatar.jpg';
        userName.textContent = user.displayName || 'مستخدم';
        
        // إظهار نموذج النشر فقط للمسؤول
        if (user.email === 'hussenmotyr2017@gmail.com') {
            postForm.style.display = 'block';
        } else {
            postForm.style.display = 'none';
        }
    } else {
        // المستخدم غير مسجل الدخول
        signInButton.style.display = 'block';
        signOutButton.style.display = 'none';
        userProfile.style.display = 'none';
        postForm.style.display = 'none';
    }
});

// تسجيل الدخول عبر Google
document.getElementById('signInButton').addEventListener('click', () => {
    auth.signInWithPopup(googleProvider)
        .then(result => {
            // تسجيل الدخول ناجح
            const user = result.user;
            
            // حفظ بيانات المستخدم في قاعدة البيانات
            database.ref('users/' + user.uid).set({
                username: user.displayName,
                email: user.email,
                profile_picture: user.photoURL,
                isBanned: false,
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .catch(error => {
            console.error('خطأ في تسجيل الدخول:', error);
            alert('حدث خطأ أثناء تسجيل الدخول: ' + error.message);
        });
});

// تسجيل الخروج
document.getElementById('signOutButton').addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log('تم تسجيل الخروج بنجاح');
        })
        .catch(error => {
            console.error('خطأ في تسجيل الخروج:', error);
        });
});