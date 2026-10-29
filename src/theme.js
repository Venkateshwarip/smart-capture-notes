import { StyleSheet } from 'react-native';

export const CATEGORIES = ['General', 'Work', 'Personal', 'Receipts', 'Ideas'];

export const colors = {
  primary: '#00796B',
  bg: '#F4F6F6',
  card: '#FFFFFF',
  text: '#1B1B1B',
  muted: '#6B7280',
  error: '#B3261E',
  border: '#D0D5D5',
};

export const shared = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  // Caps width so the layout stays good on tablets / landscape
  content: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '600', flex: 1 },
  headerBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  headerBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
