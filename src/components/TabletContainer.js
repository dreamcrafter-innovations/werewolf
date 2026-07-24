import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';

/**
 * Responsive centred column.
 *   < 768   phone          → 500
 *   768-1099 iPad / tab     → 680
 *   1100+   web / wide tab  → 900
 */
export default function TabletContainer({ children, style }) {
  const { width } = useWindowDimensions();
  const maxWidth = width >= 1100 ? 900 : width >= 768 ? 680 : 500;
  const webFix = Platform.OS === 'web' ? { minHeight: 0 } : {};

  return (
    <View style={[{ flex: 1, alignItems: 'center', width: '100%' }, webFix, style]}>
      <View style={[{ flex: 1, width: '100%', maxWidth }, webFix]}>
        {children}
      </View>
    </View>
  );
}
