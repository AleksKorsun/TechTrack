// app/components/Map.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import MapGL, { Marker, Popup, ViewState, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster, { ClusterProperties } from 'supercluster'; // Импорт ClusterProperties
import { Technician, Order } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTechnicians } from '../store/techniciansSlice';
import { fetchOrders } from '../store/ordersSlice';
import { RootState, AppDispatch } from '../store/store';
import TechnicianMarker from './TechnicianMarker';
import OrderMarker from './OrderMarker';
import io from 'socket.io-client';
import MapFilters from './MapFilters';
import MapSearch from './MapSearch';
import { Snackbar } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Feature, Point } from 'geojson';

// Свойства для обычных точек (например, техников и заказов)
interface TechnicianProperties {
  cluster: false;
  type: 'technician';
  technicianId: number;
}

interface OrderProperties {
  cluster: false;
  type: 'order';
  orderId: number;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Map: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { technicians } = useSelector((state: RootState) => state.technicians);
  const { orders } = useSelector((state: RootState) => state.orders);

  const [viewport, setViewport] = useState<ViewState>({
    latitude: 55.751244,
    longitude: 37.618423,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Обновленные состояния фильтров
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [technicianStatusFilter, setTechnicianStatusFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState<Dayjs | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Dayjs | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Инициализация супер-кластера
  const [superclusterInstance, setSuperclusterInstance] = useState<Supercluster<any, any> | null>(null);

  // Функция для загрузки данных с учётом фильтров
  const loadData = () => {
    const orderParams: any = {};
    if (orderStatusFilter !== 'all') {
      orderParams.status = orderStatusFilter;
    }
    if (startDateFilter) {
      orderParams.start_date = startDateFilter.toISOString();
    }
    if (endDateFilter) {
      orderParams.end_date = endDateFilter.toISOString();
    }

    dispatch(fetchOrders(orderParams));

    const technicianParams: any = {};
    if (technicianStatusFilter !== 'all') {
      technicianParams.status = technicianStatusFilter;
    }

    dispatch(fetchTechnicians(technicianParams));
  };

  useEffect(() => {
    loadData();
  }, [orderStatusFilter, technicianStatusFilter, startDateFilter, endDateFilter]);

  useEffect(() => {
    const socket = io('http://localhost:8000'); // Замените на ваш адрес сервера

    socket.on('technicianUpdate', (updatedTechnician: Technician) => {
      dispatch({
        type: 'technicians/updateTechnicianStateLocally',
        payload: updatedTechnician,
      });
      setSnackbarMessage(`Техник ${updatedTechnician.name} обновлен.`);
      setSnackbarOpen(true);
    });

    socket.on('orderUpdate', (updatedOrder: Order) => {
      dispatch({
        type: 'orders/updateOrderStateLocally',
        payload: updatedOrder,
      });
      setSnackbarMessage(`Заказ #${updatedOrder.id} обновлен.`);
      setSnackbarOpen(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    // Тип, объединяющий свойства для точек техников, заказов и кластеров
    type MapFeatureProperties = TechnicianProperties | OrderProperties | ClusterProperties;

    // Пример создания точек техников и заказов
    const technicianPoints: Feature<Point, TechnicianProperties>[] = technicians.map((technician) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        type: 'technician',
        technicianId: technician.id,
      },
      geometry: {
        type: 'Point',
        coordinates: [technician.longitude, technician.latitude],
      },
    }));

    const orderPoints: Feature<Point, OrderProperties>[] = orders.map((order) => ({
      type: 'Feature',
      properties: {
        cluster: false,
        type: 'order',
        orderId: order.id,
      },
      geometry: {
        type: 'Point',
        coordinates: [order.longitude, order.latitude],
      },
    }));






    const supercluster = new Supercluster({
      radius: 75,
      maxZoom: 20,
    });

    supercluster.load([...technicianPoints, ...orderPoints]);
    setSuperclusterInstance(supercluster);
  }, [technicians, orders]);

  // Получение кластеров
  const clusters = useMemo(() => {
    if (!superclusterInstance) return [];
    const bounds: [number, number, number, number] = [
      viewport.longitude - 0.1,
      viewport.latitude - 0.1,
      viewport.longitude + 0.1,
      viewport.latitude + 0.1,
    ];
    return superclusterInstance.getClusters(bounds, Math.floor(viewport.zoom));
  }, [superclusterInstance, viewport]);

  return (
    <div>
      <MapFilters
        orderStatusFilter={orderStatusFilter}
        setOrderStatusFilter={setOrderStatusFilter}
        technicianStatusFilter={technicianStatusFilter}
        setTechnicianStatusFilter={setTechnicianStatusFilter}
        startDateFilter={startDateFilter}
        setStartDateFilter={setStartDateFilter}
        endDateFilter={endDateFilter}
        setEndDateFilter={setEndDateFilter}
      />
      <MapSearch />
      <MapGL
        {...viewport}
        style={{ width: '100%', height: '80vh' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onMove={(evt) => setViewport(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-left" />

        {/* Отображение кластеров и маркеров */}
        {clusters.map((cluster: any) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            return (
              <Marker key={`cluster-${cluster.id}`} longitude={longitude} latitude={latitude}>
                <div
                  style={{
                    width: `${10 + (pointCount / technicians.length) * 20}px`,
                    height: `${10 + (pointCount / technicians.length) * 20}px`,
                    backgroundColor: 'rgba(0, 0, 255, 0.5)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                  onClick={() => {
                    const expansionZoom = superclusterInstance!.getClusterExpansionZoom(cluster.id);
                    setViewport({
                      ...viewport,
                      zoom: expansionZoom,
                      longitude,
                      latitude,
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          // Отображение индивидуальных маркеров
          const { type } = cluster.properties;

          if (type === 'technician') {
            const technician = technicians.find(
              (tech) => tech.id === cluster.properties.technicianId
            );
            if (!technician) return null;
            return (
              <Marker
                key={`technician-${technician.id}`}
                longitude={technician.longitude}
                latitude={technician.latitude}
                onClick={() => setSelectedTechnician(technician)}
              >
                <TechnicianMarker status={technician.status} />
              </Marker>
            );
          }

          if (type === 'order') {
            const order = orders.find((ord) => ord.id === cluster.properties.orderId);
            if (!order) return null;
            return (
              <Marker
                key={`order-${order.id}`}
                longitude={order.longitude}
                latitude={order.latitude}
                onClick={() => setSelectedOrder(order)}
              >
                <OrderMarker status={order.status} />
              </Marker>
            );
          }

          return null;
        })}

        {/* Попап для техника */}
        {selectedTechnician && (
          <Popup
            longitude={selectedTechnician.longitude}
            latitude={selectedTechnician.latitude}
            onClose={() => setSelectedTechnician(null)}
            closeOnClick={false}
          >
            <div>
              <h3>{selectedTechnician.name}</h3>
              <p>Статус: {selectedTechnician.status}</p>
            </div>
          </Popup>
        )}

        {/* Попап для заказа */}
        {selectedOrder && (
          <Popup
            longitude={selectedOrder.longitude}
            latitude={selectedOrder.latitude}
            onClose={() => setSelectedOrder(null)}
            closeOnClick={false}
          >
            <div>
              <h3>Заказ #{selectedOrder.id}</h3>
              <p>Клиент: {selectedOrder.clientName}</p>
              <p>Статус: {selectedOrder.status}</p>
            </div>
          </Popup>
        )}
      </MapGL>
      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
};

export default Map;


