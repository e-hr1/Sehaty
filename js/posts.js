// إدارة المنشورات والتعليقات
document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('postsContainer');
    const postForm = document.getElementById('postForm');
    const postContent = document.getElementById('postContent');
    const postImage = document.getElementById('postImage');
    const submitPost = document.getElementById('submitPost');
    const commentModal = document.getElementById('commentModal');
    const commentsContainer = document.getElementById('commentsContainer');
    const commentText = document.getElementById('commentText');
    const submitComment = document.getElementById('submitComment');
    const closeModal = document.querySelector('.close-modal');
    
    let currentPostId = null;
    
    // تحميل المنشورات
    function loadPosts() {
        postsContainer.innerHTML = '<div class="loading">جاري تحميل المنشورات...</div>';
        
        database.ref('posts').orderByChild('timestamp').once('value')
            .then(snapshot => {
                postsContainer.innerHTML = '';
                
                if (!snapshot.exists()) {
                    postsContainer.innerHTML = '<div class="no-posts">لا توجد منشورات بعد</div>';
                    return;
                }
                
                const posts = [];
                snapshot.forEach(childSnapshot => {
                    posts.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                
                // عرض المنشورات من الأحدث إلى الأقدم
                posts.reverse().forEach(post => {
                    if (!post.isBanned) {
                        renderPost(post);
                    }
                });
            })
            .catch(error => {
                console.error('خطأ في تحميل المنشورات:', error);
                postsContainer.innerHTML = '<div class="error">حدث خطأ أثناء تحميل المنشورات</div>';
            });
    }
    
    // عرض المنشور
    function renderPost(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.dataset.id = post.id;
        
        // تحويل الطابع الزمني إلى تاريخ مقروء
        const postDate = new Date(post.timestamp);
        const formattedDate = postDate.toLocaleString('ar-SA');
        
        let imageHtml = '';
        if (post.imageUrl) {
            imageHtml = `<img src="${post.imageUrl}" alt="صورة المنشور" class="post-image">`;
        }
        
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.authorPhoto || 'images/default-avatar.jpg'}" alt="صورة الناشر" class="post-avatar">
                <div>
                    <div class="post-author">${post.authorName}</div>
                    <div class="post-date">${formattedDate}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            ${imageHtml}
            <div class="post-actions">
                <div class="post-action like-action ${post.likes && post.likes[auth.currentUser?.uid] ? 'liked' : ''}" data-action="like">
                    <i class="fas fa-thumbs-up"></i>
                    <span class="like-count">${post.likeCount || 0}</span>
                </div>
                <div class="post-action comment-action" data-action="comment">
                    <i class="fas fa-comment"></i>
                    <span class="comment-count">${post.commentCount || 0}</span>
                </div>
                <div class="post-action share-action" data-action="share">
                    <i class="fas fa-share"></i>
                    <span>مشاركة</span>
                </div>
            </div>
        `;
        
        postsContainer.appendChild(postElement);
        
        // إضافة مستمعي الأحداث للأزرار
        postElement.querySelector('.like-action').addEventListener('click', handleLike);
        postElement.querySelector('.comment-action').addEventListener('click', () => openComments(post.id));
        postElement.querySelector('.share-action').addEventListener('click', () => sharePost(post.id));
    }
    
    // التعامل مع الإعجاب
    function handleLike(e) {
        const postId = e.target.closest('.post').dataset.id;
        const userId = auth.currentUser?.uid;
        
        if (!userId) {
            alert('يجب تسجيل الدخول للإعجاب بالمنشورات');
            return;
        }
        
        const postRef = database.ref(`posts/${postId}`);
        const likeRef = database.ref(`posts/${postId}/likes/${userId}`);
        
        likeRef.once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    // إزالة الإعجاب
                    likeRef.remove();
                    postRef.child('likeCount').transaction(count => (count || 0) - 1);
                    e.target.closest('.like-action').classList.remove('liked');
                } else {
                    // إضافة إعجاب
                    likeRef.set(true);
                    postRef.child('likeCount').transaction(count => (count || 0) + 1);
                    e.target.closest('.like-action').classList.add('liked');
                }
            });
    }
    
    // فتح التعليقات
    function openComments(postId) {
        currentPostId = postId;
        commentsContainer.innerHTML = '<div class="loading">جاري تحميل التعليقات...</div>';
        commentModal.style.display = 'block';
        
        // تحميل التعليقات
        database.ref(`comments/${postId}`).orderByChild('timestamp').once('value')
            .then(snapshot => {
                commentsContainer.innerHTML = '';
                
                if (!snapshot.exists()) {
                    commentsContainer.innerHTML = '<div class="no-comments">لا توجد تعليقات بعد</div>';
                    return;
                }
                
                snapshot.forEach(childSnapshot => {
                    const comment = childSnapshot.val();
                    renderComment(comment);
                });
            })
            .catch(error => {
                console.error('خطأ في تحميل التعليقات:', error);
                commentsContainer.innerHTML = '<div class="error">حدث خطأ أثناء تحميل التعليقات</div>';
            });
    }
    
    // عرض التعليق
    function renderComment(comment) {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        // تحويل الطابع الزمني إلى تاريخ مقروء
        const commentDate = new Date(comment.timestamp);
        const formattedDate = commentDate.toLocaleString('ar-SA');
        
        commentElement.innerHTML = `
            <img src="${comment.authorPhoto || 'images/default-avatar.jpg'}" alt="صورة المعلق" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-author">${comment.authorName} <span class="comment-date">${formattedDate}</span></div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `;
        
        commentsContainer.appendChild(commentElement);
    }
    
    // إرسال تعليق
    submitComment.addEventListener('click', () => {
        const text = commentText.value.trim();
        const user = auth.currentUser;
        
        if (!user) {
            alert('يجب تسجيل الدخول لإضافة تعليق');
            return;
        }
        
        if (!text) {
            alert('الرجاء إدخال نص التعليق');
            return;
        }
        
        if (!currentPostId) return;
        
        const commentRef = database.ref(`comments/${currentPostId}`).push();
        const commentData = {
            text: text,
            authorId: user.uid,
            authorName: user.displayName || 'مستخدم',
            authorPhoto: user.photoURL,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        
        commentRef.set(commentData)
            .then(() => {
                // تحديث عدد التعليقات في المنشور
                database.ref(`posts/${currentPostId}/commentCount`).transaction(count => (count || 0) + 1);
                
                // إضافة التعليق إلى القائمة
                renderComment(commentData);
                
                // مسح حقل النص
                commentText.value = '';
            })
            .catch(error => {
                console.error('خطأ في إرسال التعليق:', error);
                alert('حدث خطأ أثناء إرسال التعليق');
            });
    });
    
    // مشاركة المنشور
    function sharePost(postId) {
        if (navigator.share) {
            navigator.share({
                title: 'منشور من الشركة التخصصية الحديثة',
                text: 'اطلع على هذا المنشور المميز',
                url: window.location.href + '?post=' + postId
            })
            .catch(error => console.log('خطأ في المشاركة:', error));
        } else {
            // Fallback for browsers that don't support Web Share API
            const shareUrl = window.location.href + '?post=' + postId;
            prompt('انسخ الرابط للمشاركة:', shareUrl);
        }
    }
    
    // نشر منشور جديد
    submitPost.addEventListener('click', () => {
        const content = postContent.value.trim();
        const user = auth.currentUser;
        const imageFile = postImage.files[0];
        
        if (!user) {
            alert('يجب تسجيل الدخول لنشر منشور');
            return;
        }
        
        if (!content && !imageFile) {
            alert('الرجاء إدخال محتوى أو صورة للمنشور');
            return;
        }
        
        if (user.email !== 'hussenmotyr2017@gmail.com') {
            alert('ليس لديك صلاحية نشر منشورات');
            return;
        }
        
        const postRef = database.ref('posts').push();
        const postData = {
            content: content,
            authorId: user.uid,
            authorName: user.displayName || 'مسؤول',
            authorPhoto: user.photoURL,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            likeCount: 0,
            commentCount: 0,
            isBanned: false
        };
        
        if (imageFile) {
            // رفع الصورة إلى التخزين
            const storageRef = storage.ref(`post_images/${postRef.key}`);
            const uploadTask = storageRef.put(imageFile);
            
            uploadTask.on('state_changed', 
                null, 
                error => {
                    console.error('خطأ في رفع الصورة:', error);
                    alert('حدث خطأ أثناء رفع الصورة');
                }, 
                () => {
                    // الحصول على رابط الصورة بعد الرفع
                    uploadTask.snapshot.ref.getDownloadURL().then(imageUrl => {
                        postData.imageUrl = imageUrl;
                        postRef.set(postData)
                            .then(() => {
                                postContent.value = '';
                                postImage.value = '';
                                loadPosts();
                            });
                    });
                }
            );
        } else {
            postRef.set(postData)
                .then(() => {
                    postContent.value = '';
                    loadPosts();
                });
        }
    });
    
    // إغلاق المودال
    closeModal.addEventListener('click', () => {
        commentModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === commentModal) {
            commentModal.style.display = 'none';
        }
    });
    
    // تحميل المنشورات عند بدء التشغيل
    loadPosts();
});