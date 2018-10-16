import React from 'react';
import PropTypes from 'prop-types';
import { AsyncStorage, Platform } from 'react-native';
import { Notifications } from 'expo';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';

export const AppContext = React.createContext();

const storeData = async (data) => {
  try {
    await AsyncStorage.setItem('@go-full:state', JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
};

// This is a different implementation of the stuff that is
// currently in the constructor, we might need it for later.

// const retrieveData = async () => {
//   try {
//     const value = await AsyncStorage.getItem('@go-full:state');
//     if (value !== null) {
//       // We have data in the store
//       return value;
//     }
//     // There is no data in the store
//     return false;
//   } catch (error) {
//     // Error retrieving data
//     return error;
//   }
// };

class AppProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // This is where we set initial state
      events: [],
      setStorageAndState: (key, value) => this.setStorageAndState(key, value),
    };
  }


  async componentDidMount() {
    await AsyncStorage.getItem('@go-full:state')
      .then(result => JSON.parse(result))
      .then(result => this.setState(result))
      .catch(error => console.log(error));

    this.setupNotificationChannels();
    await this.temporaryFunctionPleaseRemoveItsOnlyForTestingPurposesSoYeahGoodbyeAsync();
  }


  setupNotificationChannels() {
    console.log(this.state);
    if (Platform.OS === 'android') {
      // Channel for test notifications
      Notifications.createChannelAndroidAsync('test', {
        name: 'Test notifications',
        sound: true,
        priority: 'max',
        vibrate: true,
      });

      // Channel for mission critical notifications
      Notifications.createChannelAndroidAsync('mission-critical', {
        name: 'Test notifications',
        sound: true,
        priority: 'high',
        vibrate: true,
      });

      // Channel for less important notifications
      Notifications.createChannelAndroidAsync('nudge', {
        name: 'Test notifications',
        sound: true,
        priority: 'low',
        vibrate: true,
      });
    }
  }


  async setStorageAndState(key, value) {
    // Using cloneDeep to ensure immutability.
    const tempState = cloneDeep(this.state);
    tempState[key] = value;
    this.setState(tempState);
    await storeData(tempState);
  }


  async createEventAsync(eventObject) {
    const tempState = cloneDeep(this.state);
    tempState.events.push(eventObject);
    await this.setStorageAndState('events', tempState.events);
  }

  temporaryFunctionPleaseRemoveItsOnlyForTestingPurposesSoYeahGoodbyeAsync() {
    const events = [
      {
        key: 1,
        title: 'Steve jobs memorial',
        time: moment().valueOf,
        drinks: [
          {
            type: 'beer 0.5',
            gramsOfAlcohol: 19.39,
            timeStamp: moment().valueOf,

          },
          {
            type: 'beer 0.5',
            gramsOfAlcohol: 19.39,
            timeStamp: moment().add(1, 'hours').valueOf(),

          },
          {
            type: 'beer 0.5',
            gramsOfAlcohol: 19.39,
            timeStamp: moment().add(6, 'hours').valueOf(),
          },
        ],
      },
      {
        key: 2,
        title: 'a',
        time: moment().valueOf,
        drinks: [],
      },
      {
        key: 3,
        title: 'cool party i guess',
        time: moment.valueOf(),
        drinks: [],
      },
    ];

    events.forEach(event => this.createEventAsync(event));
  }

  render() {
    const { children } = this.props;
    return (
      <AppContext.Provider value={this.state}>
        {children}
      </AppContext.Provider>
    );
  }
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProvider;
