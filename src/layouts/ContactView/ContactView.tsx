import { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Contacts, { Contact, EmailAddress, PhoneNumber } from 'react-native-contacts';
import Snackbar from 'react-native-snackbar';
import { NativeStackNavigationHelpers } from '@react-navigation/native-stack/lib/typescript/src/types';
import { launchImageLibrary } from 'react-native-image-picker';
import cloneDeep from 'lodash.clonedeep';

import { RootStackParamList } from '../../../App';
import FabButton from '../../components/FabButton';
import { getInitials } from '../../helpers';
import { styles } from './styles';
import MultiForm from '../../components/MultiForm';

type TContactView = {
  route: RouteProp<RootStackParamList, 'View/Edit Contact'>;
  navigation: NativeStackNavigationHelpers;
};

const ContactView = (props: TContactView) => {
  let { contactId } = props.route.params;
  const [contact, setContact] = useState<Contact | any>();
  const [editMode, setEditMode] = useState<boolean>(false);

  useEffect(() => {
    contactId &&
      Contacts.getContactById(contactId).then((contactResponse: Contact) => {
        setContact(contactResponse);
      });
  }, [contactId]);

  const handleChangeText = (value: string, type: string, index: number = -1, key?: string) => {
    if (contact) {
      let contactClone: Contact | any = cloneDeep(contact);
      if (key && index !== -1) {
        contactClone[type][index][key] = value;
      } else {
        contactClone[type] = value;
      }

      setContact(contactClone);
    }
  };

  const updateContact = (contactToUpdate: Contact) => {
    Contacts.updateContact(contactToUpdate)
      .then(responseContact => {
        // record updated
        setContact(responseContact);
      })
      .catch(err => {
        console.error(err);
        Snackbar.show({
          text: 'Oops, we have a situation! 🚧',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor: 'red',
          textColor: 'white',
        });
      });

    // Contacts.writePhotoToPath(contactToUpdate.recordID, '../../assets/add.png')
    //   .then(data => console.log(data))
    //   .catch(err => console.error(err));
  };

  const handleFabButtonPress = async () => {
    setEditMode(!editMode);
    if (editMode && contact) {
      console.log(contact);
      updateContact(contact);
      Snackbar.show({
        text: 'Successfully updated contacts ✔️',
        duration: Snackbar.LENGTH_SHORT,
        backgroundColor: '#29BB89',
        textColor: 'white',
      });
    }
  };

  const chooseImage = () => {
    launchImageLibrary(
      {
        selectionLimit: 1,
        mediaType: 'photo',
      },
      response => {
        console.info('Response = ', response);

        if (response.didCancel) {
          console.info('User cancelled image picker');
        } else {
          if (response.assets) {
            let contactClone = cloneDeep(contact);
            contactClone.thumbnailPath = response?.assets[0]?.uri;
            contactClone.hasThumbnail = true;
            setContact(contactClone);
          }
        }
      },
    );
  };

  return contact ? (
    <View style={styles.container}>
      {contact.hasThumbnail ? (
        <Image
          style={styles.nameIcon}
          source={{
            uri: contact.thumbnailPath,
          }}
        />
      ) : (
        <View style={styles.nameInitialsView}>
          <Text style={styles.nameInitialsText}>{getInitials(contact.displayName)}</Text>
        </View>
      )}

      {editMode && (
        <View style={styles.editPhotoContainer}>
          <Text style={styles.detailsTextLabel}>Edit Photo</Text>

          <View style={styles.editPhotoButtonContainer}>
            <TouchableOpacity style={styles.editPhotoButton}>
              <Text style={styles.detailsTextValue}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editPhotoButton} onPress={chooseImage}>
              <Text style={styles.detailsTextValue}>🖼️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView style={styles.detailsContainer}>
        {!editMode ? (
          <>
            <View style={styles.emojiContainer}>
              <View style={styles.emoji}>
                <Text style={styles.detailsTextLabel}>😀</Text>
              </View>
              <View style={styles.detailsView}>
                <Text style={styles.detailsTextLabel}>Name</Text>
                <Text style={styles.detailsTextValue}>{contact.displayName}</Text>
              </View>
            </View>
            {contact.phoneNumbers.map((phoneNumber: PhoneNumber, phoneIndex: number) => {
              const label = phoneNumber.label.slice(0, 1).toUpperCase() + phoneNumber.label.slice(1);
              return (
                <View style={styles.emojiContainer} key={`phoneNumber-${phoneIndex}-emojiContainer`}>
                  <View style={styles.emoji}>
                    <Text style={styles.detailsTextLabel}>📞</Text>
                  </View>
                  <View style={styles.detailsView} key={`phoneNumber-${phoneIndex}`}>
                    <Text style={styles.detailsTextLabel}>{label}</Text>
                    <Text style={styles.detailsTextValue}>{phoneNumber.number}</Text>
                  </View>
                </View>
              );
            })}
            {contact.emailAddresses.map((emailAddress: EmailAddress, emailIndex: number) => {
              const label = emailAddress.label.slice(0, 1).toUpperCase() + emailAddress.label.slice(1);
              return (
                <View style={styles.emojiContainer} key={`emailAddress-${emailIndex}-emojiContainer`}>
                  <View style={styles.emoji}>
                    <Text style={styles.detailsTextLabel}>✉️</Text>
                  </View>
                  <View style={styles.detailsView} key={`emailAddress-${emailIndex}`}>
                    <Text style={styles.detailsTextLabel}>{label}</Text>
                    <Text style={styles.detailsTextValue}>{emailAddress.email}</Text>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <>
            <MultiForm type="displayName" contact={contact} setContact={setContact} handleChangeText={handleChangeText} />
            <MultiForm type="phoneNumbers" contact={contact} setContact={setContact} handleChangeText={handleChangeText} />
            <MultiForm type="emailAddresses" contact={contact} setContact={setContact} handleChangeText={handleChangeText} />
          </>
        )}
      </ScrollView>
      <View style={styles.fabView}>
        <FabButton type="edit" onPress={handleFabButtonPress} isActive={editMode} />
      </View>
    </View>
  ) : (
    <></>
  );
};

export default ContactView;
