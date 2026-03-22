import './App.css';
import { LocationFeed } from './components/LocationFeed';

function App() {
  return (
    <div className='app'>
      <header className='app-header'>
        <div className='app-header__inner'>
          <a className='app-header__company' href='/'>
            AFH Wealth Management
          </a>
        </div>
      </header>
      <section className='app-title-bar'>
        <div className='app-title-bar__inner'>
          <h1 className='app-title-bar__heading'>Our Offices</h1>
          <p className='app-title-bar__sub'>Find your nearest AFH Wealth Management office across the UK.</p>
        </div>
      </section>
      <main className='app-main' id='main'>
        <div className='app-main__inner'>
          <LocationFeed />
        </div>
      </main>
      <footer className='app-footer'>
        <div className='app-footer__inner'>
          <p>&copy; {new Date().getFullYear()} AFH Wealth Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
