import './App.css';

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
      <main className='app-main'>
        <div className='app-main__inner'>
          <div className='app-hero'>
            <h1 className='app-hero__title'>Our Offices</h1>
            <p className='app-hero__subtitle'>Find your nearest AFH Wealth Management office across the UK.</p>
          </div>
          <p>List of offices</p>
        </div>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} AFH Wealth Management. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
