import { Remedy } from '@/contexts/remedyContext';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

const CHANNEL_ID = 'medications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(){
  if(Platform.OS === 'android'){
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de remédios',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],

    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  if(existingStatus === 'granted') return true

  const { status: newStatus } = await Notifications.requestPermissionsAsync()
  if(newStatus !== 'granted'){
    Alert.alert("Aviso", "Sem permissão de notificação.")
    return false
  }


  return newStatus === 'granted'
}

type RemedyToSchedule = Pick<Remedy, "id" | "name"| "quantity"| "time_to_take">

export function scheduleMedicationNotification(remedy: RemedyToSchedule){
  const [ hour, minute ] = remedy.time_to_take.split(":").map(Number)

  return Notifications.scheduleNotificationAsync({
    identifier: `remedy-${remedy.id}`,
    content: {
      title: 'Hora do remédio!!💊',
      body: `${remedy.name} - ${remedy.quantity} unidade(s).`,
      data: { remedyId: remedy.id},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID
    }
  })
}