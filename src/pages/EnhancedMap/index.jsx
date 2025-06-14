import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedAccessibilityMap from '../../components/EnhancedAccessibilityMap';

const EnhancedMap = () => {
  const navigate = useNavigate();
  const { scenicId } = useParams();

  return (
    <EnhancedAccessibilityMap 
      center={[116.397428, 39.90923]} // 故宫坐标
      scenicId={scenicId || '1'}
      title="智能无障碍导航"
      onClose={() => navigate(-1)}
      height="100vh"
    />
  );
};

export default EnhancedMap; 