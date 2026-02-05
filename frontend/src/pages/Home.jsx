import { Link } from 'react-router-dom';
import PageTitle from '../components/PageTitle'

const Home = () => {
  return (
    <>
      <PageTitle>
        <Link to="/signin">
          singin
        </Link>
      </PageTitle>
    </>
  );
};

export default Home;
