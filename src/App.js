import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./components/Home";
import EditTrip from "./components/EditTrip";
import MyTrips from "./components/MyTrips";
import NewTrip from "./components/NewTrip";
import Trip from "./components/Trip";
import WorldMap from "./components/WorldMap";
import Logo from "./components/Logo";
import PageNotFound from "./components/PageNotFound";
import { initializeDemoData } from "./services/seedData";

function App() {
  initializeDemoData();

  return (
    <Router>
      <div className="App">
        <header className="header"></header>
        <main className="main">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/myTrips/:id/edit">
              <Logo />
              <EditTrip />
            </Route>
            <Route path="/myTrips/:id">
              <Logo />
              <Trip />
            </Route>
            <Route path="/myTrips">
              <Logo />
              <MyTrips />
            </Route>
            <Route path="/newTrip">
              <Logo />
              <NewTrip />
            </Route>
            <Route path="/worldMap">
              <Logo />
              <WorldMap />
            </Route>
            <Route path="*">
              <Logo />
              <PageNotFound />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
