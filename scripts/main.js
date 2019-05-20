/* eslint-env browser */
/* globals React ReactDOM fetch window document localStorage $ */
(function main() {
  const queryParams = window.location.hash
    .substr(1)
    .split('&')
    .map(e => e.split('='))
    .reduce((acc, e) => Object.assign({}, acc, {
      [e[0]]: e[1],
    }), {});
  window.location.hash = '';

  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const mePlaylistsEndpoint = 'https://api.spotify.com/v1/me/playlists';

  document.querySelector('#spotifyLogin').addEventListener('click', () => {
    const clientId = '0177b27a57d54dcf904007b943b53ade';
    const redirectUri = window.location.href.split('#')[0];
    const scopes = [
      'ugc-image-upload',
      'playlist-modify-private',
      'playlist-modify-public',
      'playlist-read-private',
      'playlist-read-collaborative',
    ];
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token`;
  });

  const PlaylistThumbnail = ({
    // eslint-disable-next-line react/prop-types
    id, name, images, owner,
  }) => React.createElement('div', {
    className: 'col-sm-6 col-md-4',
    key: `playlistThumbnailDiv${id}`,
  }, [
    React.createElement('div', {
      className: 'thumbnail',
      key: `playlistThumbnailDivThumbnailClass${id}`,
    }, [
      React.createElement('img', {
        src: images[0] ? images[0].url : '',
        className: 'img-responsive',
        key: `playlistCoverImage${id}`,
        style: {
          minWidth: 350,
        },
        alt: `${name} Playlist Album Cover`,
      }),
      React.createElement('div', {
        className: 'caption',
        key: `div${id}`,
      }, [
        React.createElement('h3', {
          key: `h3${id}`,
          style: {
            maxHeight: '1.2em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }, name),
        React.createElement('p', {
          key: `p${id}`,
        }, React.createElement('a', {
          className: 'btn btn-stroked-dark',
          role: 'button',
          href: '#',
          onClick: (clickEvent) => {
            clickEvent.preventDefault();
            document.getElementById('modal-title').text = `Change ${name}'s cover photo`;
            document.querySelector('input#playlist-id').value = id;
            document.querySelector('input#user-id').value = owner.id;

            $('#myModal').modal('show');
          },
          key: `a${id}`,
        }, 'New Image...')),
      ]),
    ]),
  ]);

  // PlaylistThumbnail.propTypes = {
  //   id: React.PropTypes.string,
  //   name: React.PropTypes.string,
  //   images: React.PropTypes.arrayOf({
  //     href: React.PropTypes.string,
  //   }),
  //   tracks: React.PropTypes.arrayOf({
  //     href: React.PropTypes.string,
  //   }),
  //   owner: React.PropTypes.string
  // };

  if (queryParams.access_token) {
    const time = new Date();
    localStorage.setItem('token', queryParams.access_token);
    localStorage.setItem('expires_at', JSON.stringify(time.setSeconds(time.getSeconds() + parseInt(queryParams.expires_in, 10))));
  }

  if (localStorage.getItem('token')) {
    const token = localStorage.getItem('token');

    const render = () => {
      fetch(`${mePlaylistsEndpoint}?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(response => response.json()).then((data) => {
        window.data = data;
        ReactDOM.render(React.createElement('div', null, data.items.map((e) => {
          const obj = Object.assign({}, e, {
            key: `playlistThumbnail${e.id}`,
          });
          return React.createElement(PlaylistThumbnail, obj, null);
        })), document.getElementById('root'));
      });
    };

    document.querySelector('form#image-upload').addEventListener('submit', (event) => {
      event.preventDefault();

      $('#myModal').modal('hide');

      const data = Array.prototype.map.bind(event.target)(e => ({
        value: e.value,
        name: e.attributes.name ? e.attributes.name.value : '',
      })).reduce((acc, el) => Object.assign({}, acc, { [el.name]: el.value }));

      const reader = new FileReader();

      reader.onload = (frEvent) => {
        fetch(`https://api.spotify.com/v1/users/${data['user-id']}/playlists/${data['playlist-id']}/images`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'image/jpeg',
          },
          body: frEvent.target.result.substring(23),
        });
        setTimeout(render, 1500);
      };
      reader.readAsDataURL(event.target[0].files[0]);
      render();
    });


    render();
  } else {
    // Something bad has happened, but we no-console
    // console.log('no token');
  }
}());
