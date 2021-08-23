
const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

/* Helper function for fetch */
function fetchData(url) {
  return fetch(url).then(function (res) {
    return res.json();
  }).catch(function (err) {
    console.error(err);
  });
}

function fetchUsers() {
  return fetchData(`${ BASE_URL }/users`);
}

function renderUser(user) {
  let newDiv = `<div class="user-card">
  <header>
    <h2>${user.name}</h2>
  </header>
  <section class="company-info">
    <p><b>Contact:</b> ${user.email}</p>
    <p><b>Works for:</b> ${user.company.name}</p>
    <p><b>Company creed:</b> "${user.company.catchPhrase + ", which will " + user.company.bs + "!"}"</p>
  </section>
  <footer>
    <button class="load-posts">POSTS BY ${user.username}</button>
    <button class="load-albums">ALBUMS BY ${user.username}</button>
  </footer>
  </div>`
  return $(newDiv).data('user', user);
}

function renderUserList(userList) {
  $('#user-list').empty();
  
  userList.forEach(function (user) {
    $('#user-list').append( renderUser(user) );
  });
}


function fetchUserAlbumList(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/albums?_expand=user&_embed=photos`);
}

function renderAlbum(album) {
  let newDiv = $(`<div class="album-card">
  <header>
    <h3>${ album.title }, by ${ album.user.username } </h3>
  </header>
  <section class="photo-list">
  </section>
  </div>`);

  let list = newDiv.find('.photo-list');

  album.photos.forEach(function (photo) {
    list.append( renderPhoto(photo) );
  });

  return newDiv;
}

function renderPhoto(photo) {
  let newDiv = `<div class="photo-card">
    <a href="${ photo.url }" target="_blank">
      <img src="${ photo.thumbnailUrl }" />
      <figure>${ photo.title }</figure>
    </a>
  </div>`

  return newDiv;
}

function renderAlbumList(albumList) {
  $('#app section.active').removeClass('active');
  $('#album-list').empty().addClass('active');

  albumList.forEach(function (album) {
    $('#album-list').append( renderAlbum(album) );
  });  
}

function fetchUserPosts(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
}

function renderPost(post) {
  let newDiv = `<div class="post-card">
 <header>
  <h3>${ post.title }</h3>
  <h3>--- ${ post.user.username }</h3>
 </header>
    <p>${ post.body }</p>
  <footer>
    <div class="comment-list"></div>
   <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
  </footer>
  </div>`
  
  return $(newDiv).data('post', post);
}

function renderPostList(postList) {
  $('#app section.active').removeClass('active');
  $('#post-list').empty().addClass('active');

  postList.forEach(function (post) {
    $('#post-list').append( renderPost(post) );
  });
}

function fetchPostComments(postId) {
  return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
}

function setCommentsOnPost(post) {
  // if we already have comments, don't fetch them again
  if (post.comments) {
     // #1: Something goes here
    return Promise.reject(null);
  }

  // fetch, upgrade the post object, then return it
  return fetchPostComments(post.id)
  .then(function (comments) {
    // #2: Something goes here
    post.comments = comments;

    return post;
  });
}

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find('footer');

  if (footerElement.hasClass('comments-open')) {
    footerElement.removeClass('comments-open');
    footerElement.find('.verb').text('show');
  } else {
    footerElement.addClass('comments-open');
    footerElement.find('.verb').text('hide');
  }
}

$('#user-list').on('click', '.user-card .load-posts', function () {
  let user = $(this).closest('.user-card').data('user');

  fetchUserPosts(user.id).then(renderPostList);
});

$('#user-list').on('click', '.user-card .load-albums', function () {
  let user = $(this).closest('.user-card').data('user');

  fetchUserAlbumList(user.id).then(renderAlbumList);
});

$('#post-list').on('click', '.post-card .toggle-comments', function () {
  const postCardElement = $(this).closest('.post-card');
  const post = postCardElement.data('post');
  let list = postCardElement.find('.comment-list');

  setCommentsOnPost(post)
    .then(function (post) {
      list.empty();
      post.comments.forEach(function (comment) {
        list.prepend($(`<h3>${ comment.body } --- ${ comment.email }</h3>`));
      });
      toggleComments(postCardElement);
    })
    .catch(function () {
      toggleComments(postCardElement);
    });
});

/* Starting up application */
function bootstrap() {
  fetchUsers().then(renderUserList);
}

bootstrap();
