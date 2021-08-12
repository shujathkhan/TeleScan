import { NativeStackNavigationHelpers } from '@react-navigation/native-stack/lib/typescript/src/types';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, View, Image, SafeAreaView } from 'react-native';
import Contacts, { Contact } from 'react-native-contacts';

import { contactPermissions, requestPermissions, sortByGivenName, wait } from '../../helpers';
import ContactCard from '../../components/ContactCard';
import FabButton from '../../components/FabButton';
import { styles } from './styles';
import Snackbar from 'react-native-snackbar';

type TContactList = {
  navigation: NativeStackNavigationHelpers;
};

const ContactList = (props: TContactList) => {
  const [contactList, setContactList] = useState<Array<Contact>>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadContacts = () => {
    Contacts.getAll()
      .then(contacts => {
        let sortedContact = sortByGivenName(contacts);
        setContactList(sortedContact);
        Snackbar.show({
          text: `Successfully loaded ${contacts.length} contacts 💯`,
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: '#29BB89',
          textColor: 'white',
        });
      })
      .catch(err => {
        setContactList([]);
        console.error(err);
        Snackbar.show({
          text: 'Oops, we have a situation! 🚧',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: 'red',
          textColor: 'white',
        });
      });
  };

  useEffect(() => {
    async function fetchData() {
      const isPermissionGranted = await requestPermissions(contactPermissions);
      if (isPermissionGranted) {
        loadContacts();
      } else {
        setContactList([]);
        Snackbar.show({
          text: 'Well, feel free to explore 👍',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: '#185ADB',
          textColor: 'white',
        });
      }
    }
    fetchData();
  }, []);

  const contactItem = (childProps: { item: Contact; index: number }) => {
    return childProps.item.displayName && childProps.item.displayName !== 'undefined' ? (
      <ContactCard
        name={childProps.item.displayName}
        nameIconPath={childProps.item.thumbnailPath}
        onPress={() =>
          props.navigation.navigate('View/Edit Contact', {
            contactId: childProps.item.recordID,
          })
        }
        key={childProps.item.recordID}
      />
    ) : null;
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadContacts();
    wait(250).then(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Showing {contactList.length} contacts</Text>
        {/* <View style={styles.typeOfView}>
          <Text>😀</Text>
          <View style={styles.separator} />
          <Text>📃</Text>
        </View> */}
      </View>

      <View style={styles.fabView}>
        <FabButton
          type="add"
          onPress={() => {
            props.navigation.navigate('Add New Contact');
          }}
        />
      </View>
      {contactList.length ? (
        <FlatList
          data={contactList}
          renderItem={contactItem}
          initialNumToRender={10}
          keyExtractor={item => item.recordID}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.fallbackStatusView}>
          <Image source={require('../../assets/blank.png')} />
          <View style={styles.fallbackStatusTextView}>
            <Text style={styles.fallbackStatusText}>No contacts to display</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ContactList;
