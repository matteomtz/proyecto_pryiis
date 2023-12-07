import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Text, Dimensions, Button, Image } from 'react-native';
import * as Location from 'expo-location';
import logo from './assets/logo.jpg';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // radio de la Tierra en kilómetros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
};

export default function App() {
  const [mapRegion, setMapRegion] = useState({
    latitude: 19.289,
    longitude: -99.7009,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [markers, setMarkers] = useState({
    veterinaria: {
      latitude: 19.289781722099555,
      longitude: -99.70096412185161,
      title: "Veterinaria",
      description: "Veterinaria Ojuelos",
      image: logo,
    },
    repartidor1: {
      latitude: 19.30109101593665,
      longitude: -99.72627166526158,
      title: "Repartidor #1",
      description: "Ubicación del Repartidor #1",
    },
    repartidor2: {
      latitude: 19.29958652222124,
      longitude: -99.69030477900111,
      title: "Repartidor #2",
      description: "Ubicación del Repartidor #2",
    },
  });

  const [repartidorDistances, setRepartidorDistances] = useState({});

  const userLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });

      if (location && location.coords) {
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.092,
          longitudeDelta: 0.0421,
        });

        console.log('Ubicación actual:', location.coords.latitude, location.coords.longitude);

        // Calcular distancias y actualizar el estado
        let distances = {};
        Object.keys(markers).forEach(markerKey => {
          const marker = markers[markerKey];
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            marker.latitude,
            marker.longitude
          );
          distances[markerKey] = distance.toFixed(2); // Redondear la distancia a dos decimales
        });
        setRepartidorDistances(distances);
      } else {
        console.error('Error al obtener la ubicación actual.');
      }
    } catch (error) {
      console.error('Error en la obtención de la ubicación:', error);
    }
  };

  useEffect(() => {
    userLocation();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={mapRegion}>
        {/* Marcador para la ubicación actual */}
        <Marker
          coordinate={mapRegion}
          title="Repartidor"
          description="Ubicación en tiempo real del repartidor"
        />

        {/* Marcadores */}
        {Object.keys(markers).map(markerKey => {
          const marker = markers[markerKey];
          return (
            <Marker
              key={markerKey}
              coordinate={marker}
              title={marker.title}
              description={marker.description}
              image={marker.image}
            />
          );
        })}
      </MapView>
      {/* Mostrar distancias en kilómetros */}
      {Object.keys(repartidorDistances).map(key => (
        <Text key={key} style={styles.distanceText}>
          {`${markers[key].title}: ${repartidorDistances[key]} km`}
        </Text>
      ))}
      <Button title="Ubicación Actual" onPress={userLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '80%',
  },
  distanceText: {
    textAlign: 'center',
    margin: 10,
  },
});
