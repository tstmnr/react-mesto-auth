import React from 'react';
import {Route, Routes, Navigate, useNavigate} from 'react-router-dom';
import '../App.css';
import api from '../utils/api.js';
import auth from '../utils/auth';
import Header from './Header';
import Main from './Main';
import Footer from './Footer'
import Login from './Login'
import Register from './Register'
import ProtectedRouteElement from './ProtectedRouteElement'
import ImagePopup from './ImagePopup';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup'
import DeletePopup from './DeletePopup';


function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = React.useState(false);
  const [cardForDelete, setCardForDelete] = React.useState({});
  const [selectedCard, setSelectedCard] = React.useState({});
  const [currentUser, setCurrentUser] = React.useState({});
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [cards, setCards] = React.useState([]);

  const navigate = useNavigate();

  React.useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userData, cardsData]) => {
        setCurrentUser({
          name: userData.name,
          about: userData.about,
          avatar: userData.avatar,
          _id: userData._id,
        });

        setCards(cardsData);
      })
      .catch(err => {
        console.log(err);
      })
  }, []);

  function handleUpdateUserData(e, userData) {
    e.preventDefault();
    api.patchUserInfo(userData)
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        closeAllPopups();
      });
    }

  function handleUpdateAvatar(e, userData) {
    e.preventDefault();
    api.patchAvatar(userData)
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        closeAllPopups();
      });
  }

  function handleAddPlaceSubmit(e, card) {
    e.preventDefault();
    api.postCard(card)
      .then((newCard) => {
        setCards([newCard, ...cards]);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        closeAllPopups();
      });
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    api.changeLikeCardStatus(card._id, isLiked)
      .then((newCards) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCards : c));
      })
      .catch((err) => console.log(err));
  }

  function handleCardDelete(e, card) {
    e.preventDefault();
    api.deleteCard(card)
      .then(() => {
        closeAllPopups();
        setCards(cards.filter(item => {
          return item._id !== card._id
        }));
      })
      .catch((err) => {
        console.error(err);
      })
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleDeleteClick(card) {
    setCardForDelete(card);
    setIsDeletePopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsDeletePopupOpen(false);
    setSelectedCard({});
  }

  function registerUser(e, data) {
    e.preventDefault();
    auth.registration(data)
      .then((res) => {
        navigate('/sign-in', {replace: true})
      })
      .catch(err => {
        console.log(err)
      })
  }

  function handleLogin(e, data) {
    e.preventDefault();
    auth.authentication(data)
      .then((res) => {
        console.log(res);
        setLoggedIn(true);
        navigate('/', {replace: true})
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <CurrentUserContext.Provider value={currentUser} >
      <div className="page">
        <div className="container">
          <Header />

          <Routes>
            <Route path="/sign-up" element={<Register onSubmit={registerUser}/>} />
            <Route path="/sign-in" element={<Login handleLogin={handleLogin} />} />
            <Route path="/" element={loggedIn ? <ProtectedRouteElement element={
              <>
                <Main
                  cards={cards}
                  onEditProfile={handleEditProfileClick}
                  onAddPlace={handleAddPlaceClick}
                  onEditAvatar={handleEditAvatarClick}
                  onCardClick={handleCardClick}
                  onCardLike={handleCardLike}
                  onCardDelete={handleDeleteClick}
                />
                <Footer />
              </>}
              loggedIn={loggedIn}/> : <Navigate to="/sign-in" replace />} />

          </Routes>



          <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onSubmit={handleUpdateUserData} />

          <DeletePopup card={cardForDelete} isOpen={isDeletePopupOpen} onClose={closeAllPopups} onSubmit={handleCardDelete} />

          <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onSubmit={handleUpdateAvatar} />

          <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onSubmit={handleAddPlaceSubmit} />

          <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
