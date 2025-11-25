import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Register Font (Opsional, pakai default Helvetica biar cepat)
// Font.register({ family: 'Roboto', src: '...' });

// Style CSS khusus PDF
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { backgroundColor: '#2563eb', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  subHeader: { color: '#bfdbfe', fontSize: 10, marginTop: 4 },
  
  section: { margin: 10, padding: 10 },
  
  // Kotak Info Utama
  infoBox: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 15, marginBottom: 15 },
  infoLeft: { width: '70%' },
  infoRight: { width: '30%', alignItems: 'flex-end' },
  
  label: { fontSize: 10, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' },
  value: { fontSize: 14, color: '#111827', fontWeight: 'bold', marginBottom: 10 },
  valueSmall: { fontSize: 12, color: '#374151', marginBottom: 8 },
  
  // Grid 2 Kolom
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  col: { width: '48%' },
  
  // QR Code Area
  qrSection: { alignItems: 'center', marginTop: 20, padding: 20, backgroundColor: '#f9fafb', borderRadius: 8 },
  qrImage: { width: 100, height: 100 },
  qrText: { fontSize: 10, color: '#6b7280', marginTop: 8 },

  footer: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#9ca3af' }
});

// Helper Rupiah
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// Component PDF
export const TicketDocument = ({ booking }: { booking: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>E-TICKET / VOUCHER</Text>
          <Text style={styles.subHeader}>Order ID: {booking.id}</Text>
        </View>
        <View>
          <Text style={{ color: 'white', fontSize: 12 }}>Pusat Bisnis</Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.section}>
        
        {/* INFO SERVICE */}
        <View style={styles.infoBox}>
          <View style={styles.infoLeft}>
            <Text style={styles.label}>Layanan</Text>
            <Text style={{ ...styles.value, fontSize: 18, color: '#2563eb' }}>{booking.service.name}</Text>
            <Text style={styles.valueSmall}>Unit: {booking.service.unit}</Text>
          </View>
          <View style={styles.infoRight}>
            <Text style={styles.label}>Status</Text>
            <Text style={{ color: '#16a34a', fontWeight: 'bold', fontSize: 14 }}>LUNAS / CONFIRMED</Text>
          </View>
        </View>

        {/* DETAIL TANGGAL */}
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.label}>Check-in / Mulai</Text>
            <Text style={styles.value}>{format(new Date(booking.start_time), 'EEEE, dd MMMM yyyy', { locale: id })}</Text>
            <Text style={styles.valueSmall}>{format(new Date(booking.start_time), 'HH:mm')} WIB</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Check-out / Selesai</Text>
            <Text style={styles.value}>{format(new Date(booking.end_time), 'EEEE, dd MMMM yyyy', { locale: id })}</Text>
            <Text style={styles.valueSmall}>{format(new Date(booking.end_time), 'HH:mm')} WIB</Text>
          </View>
        </View>

        {/* DATA TAMU */}
        <View style={{ ...styles.grid, marginTop: 10 }}>
          <View style={styles.col}>
            <Text style={styles.label}>Nama Tamu</Text>
            <Text style={styles.valueSmall}>{booking.customer_name}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Kontak</Text>
            <Text style={styles.valueSmall}>{booking.customer_phone}</Text>
            <Text style={styles.valueSmall}>{booking.customer_email}</Text>
          </View>
        </View>

        {/* QR CODE (Generate pakai API publik biar mudah) */}
        <View style={styles.qrSection}>
          {/* Kita gunakan API QR Server untuk generate gambar QR dari Booking ID */}
          <Image 
            style={styles.qrImage} 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`} 
          />
          <Text style={styles.qrText}>Tunjukkan QR Code ini kepada petugas saat kedatangan.</Text>
        </View>

      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text>Terima kasih telah memesan di Pusat Pengembangan Bisnis.</Text>
        <Text>Tiket ini adalah bukti pembayaran yang sah.</Text>
      </View>

    </Page>
  </Document>
);