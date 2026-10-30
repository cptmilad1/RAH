import Routers from "./features/router/routes";
import PresenceConnection from "./features/presence/PresenceConnection";

const App = () => {
  return (
    <>
        <PresenceConnection />
        <Routers/>
    </>
  );
}
 
export default App;