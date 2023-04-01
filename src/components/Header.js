import logo from '../images/logo.svg';

function Header() {
    return (
        <header className="header container__header">
          <div className="header__wrap">
            <img className="logo header__logo" src={logo} alt="Логотип страницы сайта Место"/>
            <a className="header__register-link" href="/sign-up">Регистрация</a>
          </div>
        </header>
    );
}

export default Header;
