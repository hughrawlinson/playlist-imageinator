/* eslint-env browser */
/* globals React ReactDOM fetch window document localStorage */
(function main() {
  const queryParams = window.location.hash.substr(1).split('&').map(e => e.split('=')).reduce((acc, e) => {
    const obj = {};
    obj[e[0]] = e[1];
    return Object.assign({}, acc, obj);
  }, {});
  window.location.hash = '';

  const authEndpoint = 'https://accounts.spotify.com/authorize';
  const mePlaylistsEndpoint = 'https://api.spotify.com/v1/me/playlists';
  const startPlaybackEndpoint = 'https://api.spotify.com/v1/me/player/play';
  const audioAnalysisEndpoint = 'https://api.spotify.com/v1/audio-analysis/';
  const seekPositionEndpoint = 'https://api.spotify.com/v1/me/player/seek';
  const stopEndpoint = 'https://api.spotify.com/v1/me/player/pause';

  document.querySelector('#spotifyLogin').addEventListener('click', () => {
    const clientId = '0177b27a57d54dcf904007b943b53ade';
    const redirectUri = window.location.href.split('#')[0];
    const scopes = [
      'ugc-image-upload',
      'playlist-modify-private',
      'playlist-modify-public',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token`;
  });

  if (queryParams.access_token) {
    const time = new Date();
    localStorage.setItem('token', queryParams.access_token);
    localStorage.setItem('expires_at', JSON.stringify(time.setSeconds(time.getSeconds() + parseInt(queryParams.expires_in, 10))));
  }

  if (localStorage.getItem('token')) {
    const token = localStorage.getItem('token');

    document.querySelector('form#image-upload').addEventListener('submit', (event) => {
      event.preventDefault();
      $('#myModal').modal('hide');

      const data = Array.prototype.map.bind(event.target)(e => ({
        value: e.value,
        name: e.attributes.name ? e.attributes.name.value : ''
      })).reduce((acc, el) => Object.assign({}, acc, {[el.name]: el.value}))

      var reader = new FileReader();

      reader.onload = function(frEvent) {
        fetch(`https://api.spotify.com/v1/users/${data['user-id']}/playlists/${data['playlist-id']}/images`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'image/jpeg'
          },
          body: frEvent.target.result.substring(23)
        })
        setTimeout(render, 1500);
      }
      reader.readAsDataURL(event.target[0].files[0]);
      render();
    });

    const PlaylistThumbnail = props => React.createElement('div', {
      className: 'col-sm-6 col-md-4',
      key: `playlistThumbnailDiv${props.id}`,
    }, [
      React.createElement('div', {
        className: 'thumbnail',
        key: `playlistThumbnailDivThumbnailClass${props.id}`,
      }, [
        React.createElement('img', {
          src: props.images[0] ? props.images[0].url : '',
          className: 'img-responsive',
          key: `playlistCoverImage${props.id}`,
          style: {
            minWidth: 350,
          },
          alt: `${props.name} Playlist Album Cover`,
        }, null),
        React.createElement('div', {
          className: 'caption',
          key: `div${props.id}`,
        }, [
          React.createElement('h3', {
            key: `h3${props.id}`,
            style: {
              maxHeight: '1.2em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }, props.name),
          React.createElement('p', {
            key: `p${props.id}`,
          }, React.createElement('a', {
            className: 'btn btn-stroked-dark',
            role: 'button',
            href: '#',
            onClick: (clickEvent) => {
              clickEvent.preventDefault();
              document.getElementById('modal-title').text = `Change ${props.name}'s cover photo`;
              document.querySelector('input#playlist-id').value = props.id;
              document.querySelector('input#user-id').value = props.owner.id;

              $('#myModal').modal('show');
            },
            key: `a${props.id}`,
          }, 'New Image...')),
        ]),
      ]),
    ]);

    PlaylistThumbnail.propTypes = {
      id: React.PropTypes.string,
      name: React.PropTypes.string,
      images: React.PropTypes.arrayOf({
        href: React.PropTypes.string,
      }),
      tracks: React.PropTypes.arrayOf({
        href: React.PropTypes.string,
      }),
    };

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
    render();
  } else {
    // Something bad has happened, but we no-console
    // console.log('no token');
  }
}());
