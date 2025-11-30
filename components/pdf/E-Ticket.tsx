import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Tables } from '@/types/supabase';

// 1. Register Font (Ambil dari CDN Google Fonts agar konsisten)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', fontFamily: 'Roboto', padding: 30 },
  
  // Header Biru
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 10, marginBottom: 20 
  },
  brand: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  title: { fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 },

  // Order ID Box
  orderBox: { backgroundColor: '#f3f4f6', padding: 10, borderRadius: 4, marginBottom: 20 },
  orderLabel: { fontSize: 8, color: '#6b7280', marginBottom: 2 },
  orderId: { fontSize: 12, fontWeight: 'bold', fontFamily: 'Courier' },

  // Content Grid
  row: { flexDirection: 'row', marginBottom: 10 },
  colHalf: { width: '50%' },
  
  label: { fontSize: 9, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase' },
  value: { fontSize: 11, color: '#111827', fontWeight: 'bold' },
  valueSmall: { fontSize: 10, color: '#374151' },

  // QR Code
  qrContainer: { 
    marginTop: 30, alignItems: 'center', 
    borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', 
    padding: 15, borderRadius: 8 
  },
  qrImage: { width: 120, height: 120 },
  qrNote: { fontSize: 9, color: '#9ca3af', marginTop: 5 },

  footer: { 
    position: 'absolute', bottom: 30, left: 30, right: 30, 
    textAlign: 'center', fontSize: 8, color: '#9ca3af', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 
  }
});

// Tipe Data
type BookingDetail = Tables<'bookings'> & {
    service: { name: string; unit: string } | null;
};

export const TicketDocument = ({ booking }: { booking: BookingDetail }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>Pusat Pengembangan Bisnis</Text>
        <Text style={styles.title}>E-Ticket</Text>
      </View>

      {/* Order Info */}
      <View style={styles.orderBox}>
         <Text style={styles.orderLabel}>KODE BOOKING</Text>
         <Text style={styles.orderId}>{booking.id.toUpperCase()}</Text>
      </View>

      {/* Service Info */}
      <View style={{ marginBottom: 20 }}>
         <Text style={styles.label}>Layanan</Text>
         <Text style={{...styles.value, fontSize: 16}}>{booking.service?.name}</Text>
         <Text style={styles.valueSmall}>Unit Sewa: {booking.service?.unit === 'per_day' ? 'Harian' : 'Per Jam'}</Text>
      </View>

      {/* Date & Time Grid */}
      <View style={styles.row}>
        <View style={styles.colHalf}>
            <Text style={styles.label}>Check-in</Text>
            <Text style={styles.value}>{format(new Date(booking.start_time), 'dd MMMM yyyy', { locale: id })}</Text>
            <Text style={styles.valueSmall}>{format(new Date(booking.start_time), 'HH:mm')} WIB</Text>
        </View>
        <View style={styles.colHalf}>
            <Text style={styles.label}>Check-out</Text>
            <Text style={styles.value}>{format(new Date(booking.end_time), 'dd MMMM yyyy', { locale: id })}</Text>
            <Text style={styles.valueSmall}>{format(new Date(booking.end_time), 'HH:mm')} WIB</Text>
        </View>
      </View>

      {/* Customer Info Grid */}
      <View style={styles.row}>
         <View style={styles.colHalf}>
            <Text style={styles.label}>Nama Pemesan</Text>
            <Text style={styles.value}>{booking.customer_name}</Text>
         </View>
         <View style={styles.colHalf}>
            <Text style={styles.label}>Kontak</Text>
            <Text style={styles.valueSmall}>{booking.customer_phone}</Text>
            <Text style={styles.valueSmall}>{booking.customer_email}</Text>
         </View>
      </View>

      {/* QR Code Section */}
      <View style={styles.qrContainer}>
         <Image 
            style={styles.qrImage} 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${booking.id}`} 
         />
         <Text style={styles.qrNote}>Tunjukkan kode ini kepada petugas untuk check-in.</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
         <Text>UIN Raden Fatah Palembang • Dokumen ini sah dan dicetak oleh komputer.</Text>
      </View>

    </Page>
  </Document>
);