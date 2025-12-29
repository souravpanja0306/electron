import PageTitle from '../components/PageTitle'

const Home = () => {
  return (
    <>
      <PageTitle>About</PageTitle>

      <div className="w-full h-full flex justify-center items-center p-6">
        <div className="w-[500px] bg-slate-900 rounded-md p-6 text-white shadow-lg">
          <h1 className="text-2xl font-semibold mb-2">Welcome to Anthropic</h1>
          <p className="text-slate-600 mb-4">
            Your intelligent business management system.
          </p>

          <div className="space-y-2 text-sm text-slate-300">
            <p><span className="font-semibold text-white">Company:</span> Anthropic Business Suite</p>
            <p><span className="font-semibold text-white">Founded:</span> 2025</p>
            <p><span className="font-semibold text-white">Industry:</span> Business Automation</p>
            <p><span className="font-semibold text-white">Location:</span> Kolkata, India</p>
          </div>

          <div className="mt-5 p-4 rounded-md bg-slate-900 text-sm text-slate-300">
            Helping businesses automate billing, inventory, finance & day-to-day operations.
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
