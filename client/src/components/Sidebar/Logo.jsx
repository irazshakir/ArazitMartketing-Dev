import ArazitLogo from '../../assets/Arazit.svg';
import FavIcon from '../../assets/FavIcon.svg';
import theme from '../../theme';

const Logo = ({ collapsed }) => {
  return (
    <div className="flex items-center space-x-2">
      <img src={ArazitLogo} alt="Arazit Logo" className="w-8 h-8" />
      {!collapsed && <span className="text-xl font-semibold text-gray-800">ArazitCRM</span>}
    </div>
  );
};

export default Logo; 