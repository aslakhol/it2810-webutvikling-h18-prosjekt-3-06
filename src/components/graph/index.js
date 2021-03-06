import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';
import PropTypes from 'prop-types';


class Graph extends Component {
  calculateDataset() {
    // This is where we calculate BAC. The math is
    // based on the wikipedia article for blood alcohol level.
    const { drinks } = this.props;
    if (drinks.length === 0) {
      return {
        labels: this.generateLabels(moment()),
        datasets: [{
          data: Array(8).fill(0),
        }], // The event should have a start time.
      };
    }
    // const { weight, gender } = appState; this is what it is supposed to be;
    // in a final product we would register weight and gender, but in this vertical slice
    // we a set of default values.
    const weight = 80;
    const gender = true;
    const BW = gender ? 0.58 : 0.49;
    const MR = gender ? 0.015 : 0.017;
    const alcoholMass = gramsOfAlcohol => (
      ((0.806 * gramsOfAlcohol * 1.2) / (weight * BW))

    );
    const alcoholLevels = new Array(8).fill(0);
    const startTime = drinks[0].timeStamp.clone();
    drinks.forEach((drink) => {
      let index = moment.duration(drink.timeStamp.diff(startTime)).asHours();
      index = Math.round(index);
      alcoholLevels[index] += alcoholMass(drink.alcoholInGrams);
    });
    alcoholLevels.forEach((levelAtHour, i) => {
      if (i === 0) {
        return;
      }
      alcoholLevels[i] += alcoholLevels[i - 1] - MR;
    });

    return {

      labels: this.generateLabels(startTime),
      datasets: [{
        data: alcoholLevels,
      }],
    };
  }

  generateLabels(startTime) {
    const labels = [];
    for (let i = 0; i < 8; i += 1) {
      const currentTime = startTime.add(1, 'hours');
      labels.push(currentTime.format('HH:MM'));
    }
    return labels;
  }


  render() {
    const data = this.calculateDataset();
    return (
      <View>
        <LineChart
          data={data} // we use the data we generate above to populate the graph.

          width={Dimensions.get('window').width} // from react-native
          height={220}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#38006B',
            backgroundGradientTo: '#38006B',
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            borderRadius: 2,
            marginRight: 0,
            marginLeft: 0,
            borderColor: '#ddd',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 5,
            marginBottom: 10,
          }}
        />
      </View>
    );
  }
}

Graph.propTypes = {
  drinks: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    alcoholInGrams: PropTypes.number.isRequired,
    timeStamp: PropTypes.instanceOf(moment).isRequired,
  })).isRequired,
};

export default Graph;
