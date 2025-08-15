// لوحة تحكم المسؤول
document.addEventListener('DOMContentLoaded', () => {
    const usersTable = document.getElementById('usersTable');
    const postsTable = document.getElementById('postsTable');
    
    // تحميل المستخدمين
    function loadUsers() {
        database.ref('users').once('value')
            .then(snapshot => {
                usersTable.innerHTML = '';
                
                if (!snapshot.exists()) {
                    usersTable.innerHTML = '<tr><td colspan="5">لا يوجد مستخدمين مسجلين</td></tr>';
                    return;
                }
                
                snapshot.forEach(childSnapshot => {
                    const user = childSnapshot.val();
                    renderUser(childSnapshot.key, user);
                });
            });
    }
    
    // عرض المستخدم
    function renderUser(userId, user) {
        const userRow = document.createElement('tr');
        userRow.dataset.id = userId;
        
        userRow.innerHTML = `
            <td><img src="${user.profile_picture || 'images/default-avatar.jpg'}" alt="صورة المستخدم" class="table-avatar"></td>
            <td>${user.username || 'مستخدم'}</td>
            <td>${user.email || 'لا يوجد بريد'}</td>
            <td>${user.isBanned ? 'محظور' : 'نشط'}</td>
            <td>
                <button class="btn btn-small ${user.isBanned ? 'btn-primary' : 'btn-secondary'} ban-btn">
                    ${user.isBanned ? 'إلغاء الحظر' : 'حظر'}
                </button>
            </td>
        `;
        
        usersTable.appendChild(userRow);
        
        // إضافة مستمع الحدث لزر الحظر
        userRow.querySelector('.ban-btn').addEventListener('click', () => toggleBan(userId, user.isBanned));
    }
    
    // تبديل حالة الحظر
    function toggleBan(userId, isBanned) {
        database.ref(`users/${userId}/isBanned`).set(!isBanned)
            .then(() => {
                loadUsers();
            });
    }
    
    // تحميل المنشورات للإدارة
    function loadPostsForAdmin() {
        database.ref('posts').once('value')
            .then(snapshot => {
                postsTable.innerHTML = '';
                
                if (!snapshot.exists()) {
                    postsTable.innerHTML = '<tr><td colspan="5">لا توجد منشورات</td></tr>';
                    return;
                }
                
                snapshot.forEach(childSnapshot => {
                    const post = childSnapshot.val();
                    renderPostForAdmin(childSnapshot.key, post);
                });
            });
    }
    
    // عرض المنشور للإدارة
    function renderPostForAdmin(postId, post) {
        const postRow = document.createElement('tr');
        postRow.dataset.id = postId;
        
        const postDate = new Date(post.timestamp);
        const formattedDate = postDate.toLocaleString('ar-SA');
        
        postRow.innerHTML = `
            <td>${post.authorName || 'مستخدم'}</td>
            <td>${post.content ? post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '') : 'لا يوجد محتوى'}</td>
            <td>${formattedDate}</td>
            <td>${post.isBanned ? 'محظور' : 'نشط'}</td>
            <td>
                <button class="btn btn-small ${post.isBanned ? 'btn-primary' : 'btn-secondary'} ban-post-btn">
                    ${post.isBanned ? 'إلغاء الحظر' : 'حظر'}
                </button>
                <button class="btn btn-small btn-danger delete-post-btn">حذف</button>
            </td>
        `;
        
        postsTable.appendChild(postRow);
        
        // إضافة مستمعي الأحداث للأزرار
        postRow.querySelector('.ban-post-btn').addEventListener('click', () => togglePostBan(postId, post.isBanned));
        postRow.querySelector('.delete-post-btn').addEventListener('click', () => deletePost(postId));
    }
    
    // تبديل حظر المنشور
    function togglePostBan(postId, isBanned) {
        database.ref(`posts/${postId}/isBanned`).set(!isBanned)
            .then(() => {
                loadPostsForAdmin();
            });
    }
    
    // حذف المنشور
    function deletePost(postId) {
        if (confirm('هل أنت متأكد من حذف هذا المنشور؟ سيتم حذف جميع التعليقات المرتبطة به أيضًا.')) {
            // حذف الصورة من التخزين إذا وجدت
            database.ref(`posts/${postId}/imageUrl`).once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        const imageUrl = snapshot.val();
                        const imageRef = storage.refFromURL(imageUrl);
                        return imageRef.delete();
                    }
                })
                .then(() => {
                    // حذف التعليقات المرتبطة
                    return database.ref(`comments/${postId}`).remove();
                })
                .then(() => {
                    // حذف المنشور نفسه
                    return database.ref(`posts/${postId}`).remove();
                })
                .then(() => {
                    loadPostsForAdmin();
                })
                .catch(error => {
                    console.error('خطأ في الحذف:', error);
                    alert('حدث خطأ أثناء حذف المنشور');
                });
        }
    }
    
    // تحميل البيانات عند بدء التشغيل
    auth.onAuthStateChanged(user => {
        if (user && user.email === 'hussenmotyr2017@gmail.com') {
            loadUsers();
            loadPostsForAdmin();
        } else {
            window.location.href = '../index.html';
        }
    });
});