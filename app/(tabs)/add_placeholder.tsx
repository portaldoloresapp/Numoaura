import { View } from 'react-native';

// Este componente serve apenas para ocupar o espaço na rota e permitir
// que o botão "+" seja renderizado na TabBar.
// A navegação real é interceptada no _layout.tsx.
export default function AddPlaceholderScreen() {
  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}
