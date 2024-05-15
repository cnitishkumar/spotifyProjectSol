import {Component} from 'react'
import Cookies from 'js-cookie'
import Header from '../Header'
import PlayerController from '../PlayerController'
import Loader from '../Loader'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'INPROGRESS',
  failure: 'FAILURE',
  success: 'SUCCESS',
}

class EditorsPicksSpecificAlbumPlayList extends Component {
  state = {
    songsPlayList: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getPlayListData()
  }

  getPlayListData = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    const formatData = data => ({
      addedAt: data.added_at,
      addedBy: data.added_by,
      durationInMs: data.track.duration_ms,
      name: data.track.name,
      artist: data.track.artists.map(artist => artist.name).join(' '),
      playListArtist: data.track.artists[0].name,
      previewUrl: data.track.preview_url,
      trackNumber: data.track.track_number,
      album: data.track.album.name,
      id: data.track.id,
      albumImageUrlsList: data.track.album.images,
    })

    const apiUrl = `https://apis2.ccbp.in/spotify-clone/playlists-details/${id}`
    const jwtToken = Cookies.get('jwt_token')

    const options = {
      header: {
        authorization: `bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(apiUrl, options)

    if (response.ok === true) {
      const data = await response.json()

      const playListData = await data.tracks.items

      const formattedData = {
        playlistData: playListData.map(each => formatData(each)),
        playListName: data.name,
        playListImageUrl: data.images[0].url,
        playListDescription: data.description,
      }

      const filteredSongs = formattedData.playlistData.filter(
        each => each.previewUrl !== null,
      )

      this.setState({
        songsPlayList: formattedData.playlistData,
        playListDetails: {
          playListName: formattedData.playListName,
          playListImageUrl: formattedData.playListImageUrl,
          playListDescription: formattedData.playListDescription,
        },
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  render() {
    const {songsPlayList, apiStatus, playListDetails} = this.state

    const result =
      apiStatus === apiStatusConstants.success ? (
        <PlayerController
          songsPlayList={songsPlayList}
          category="Editor's picks"
          playListDetails={playListDetails}
        />
      ) : (
        <Loader />
      )
    return result
  }
}

export default EditorsPicksSpecificAlbumPlayList
