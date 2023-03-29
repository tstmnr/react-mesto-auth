import logo from '../images/logo.svg';

function Header() {
    return (
        <header className="header container__header">
            <img className="logo header__logo" src={logo} alt="Логотип страницы сайта Место"/>
        </header>
    );
}

export default Header;