export default function NetworkBanner({ networkOnline, serverOnline }) {
    if (!networkOnline) return <div className="bg-red-500 text-white p-2 text-center">Offline: No Internet</div>;
    if (!serverOnline) return <div className="bg-orange-400 text-white p-2 text-center">Server Unreachable</div>;
    return null;
  }
  