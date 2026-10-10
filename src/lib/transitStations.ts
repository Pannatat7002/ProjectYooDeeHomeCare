import { calculateHaversineDistance } from './hospitalProximity';

export interface TransitStation {
    id: string;
    nameTh: string;
    nameEn: string;
    line: string;
    lineCode: 'BTS_GREEN' | 'BTS_SILOM' | 'MRT_BLUE' | 'MRT_PURPLE' | 'MRT_YELLOW' | 'MRT_PINK' | 'SRT_RED' | 'ARL';
    lat: number;
    lng: number;
}

export interface NearbyTransitStation {
    station: TransitStation;
    distanceKm: number;
    durationMinutes?: number;
    priorityOrder: number;
}

export const TRANSIT_LINES = [
    { code: 'all', name: 'ทุกสายรถไฟฟ้า' },
    { code: 'BTS_GREEN', name: 'BTS สายสุขุมวิท (สีเขียว)' },
    { code: 'BTS_SILOM', name: 'BTS สายสีลม (สีเขียวเข้ม)' },
    { code: 'MRT_BLUE', name: 'MRT สายสีน้ำเงิน' },
    { code: 'MRT_PURPLE', name: 'MRT สายสีม่วง (เตาปูน-บางใหญ่)' },
    { code: 'MRT_YELLOW', name: 'MRT สายสีเหลือง (ลาดพร้าว-สำโรง)' },
    { code: 'MRT_PINK', name: 'MRT สายสีชมพู (แคราย-มีนบุรี)' },
    { code: 'SRT_RED', name: 'SRT สายสีแดง (บางซื่อ-รังสิต)' },
    { code: 'ARL', name: 'Airport Rail Link (พญาไท-สุวรรณภูมิ)' },
];

export const POPULAR_TRANSIT_STATIONS: { id: string; nameTh: string; lineName: string }[] = [
    { id: 'bts-mochit', nameTh: 'BTS หมอชิต', lineName: 'สายสุขุมวิท' },
    { id: 'bts-ari', nameTh: 'BTS อารีย์', lineName: 'สายสุขุมวิท' },
    { id: 'bts-asok', nameTh: 'BTS อโศก', lineName: 'สายสุขุมวิท' },
    { id: 'bts-siam', nameTh: 'BTS สยาม', lineName: 'สายสุขุมวิท' },
    { id: 'mrt-bangsue', nameTh: 'MRT บางซื่อ', lineName: 'สายสีน้ำเงิน' },
    { id: 'mrt-taopoon-blue', nameTh: 'MRT เตาปูน', lineName: 'สายสีม่วง/น้ำเงิน' },
    { id: 'mrt-phranangklao', nameTh: 'MRT สะพานพระนั่งเกล้า', lineName: 'สายสีม่วง' },
    { id: 'mrt-chatuchak', nameTh: 'MRT สวนจตุจักร', lineName: 'สายสีน้ำเงิน' },
    { id: 'bts-wongwianyai', nameTh: 'BTS วงเวียนใหญ่', lineName: 'สายสีลม' },
    { id: 'bts-onnut', nameTh: 'BTS อ่อนนุช', lineName: 'สายสุขุมวิท' },
];

export const TRANSIT_STATIONS: TransitStation[] = [
    // --- BTS สายสุขุมวิท (BTS_GREEN) ---
    { id: 'bts-khukhot', nameTh: 'คูคต', nameEn: 'Khu Khot', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.9318, lng: 100.6453 },
    { id: 'bts-saphanmai', nameTh: 'สะพานใหม่', nameEn: 'Saphan Mai', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.8967, lng: 100.6074 },
    { id: 'bts-kasetsart', nameTh: 'มหาวิทยาลัยเกษตรศาสตร์', nameEn: 'Kasetsart University', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.8427, lng: 100.5756 },
    { id: 'bts-ratchayothin', nameTh: 'รัชโยธิน', nameEn: 'Ratchayothin', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.8294, lng: 100.5707 },
    { id: 'bts-ha-yaek-lat-phrao', nameTh: 'ห้าแยกลาดพร้าว', nameEn: 'Ha Yaek Lat Phrao', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.8164, lng: 100.5615 },
    { id: 'bts-mochit', nameTh: 'หมอชิต', nameEn: 'Mo Chit', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.8023, lng: 100.5537 },
    { id: 'bts-saphan-khwai', nameTh: 'สะพานควาย', nameEn: 'Saphan Khwai', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7937, lng: 100.5498 },
    { id: 'bts-ari', nameTh: 'อารีย์', nameEn: 'Ari', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7797, lng: 100.5448 },
    { id: 'bts-sanam-pao', nameTh: 'สนามเป้า', nameEn: 'Sanam Pao', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7725, lng: 100.5420 },
    { id: 'bts-victory-monument', nameTh: 'อนุสาวรีย์ชัยสมรภูมิ', nameEn: 'Victory Monument', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7629, lng: 100.5372 },
    { id: 'bts-phaya-thai', nameTh: 'พญาไท', nameEn: 'Phaya Thai', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7569, lng: 100.5348 },
    { id: 'bts-ratchathewi', nameTh: 'ราชเทวี', nameEn: 'Ratchathewi', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7519, lng: 100.5315 },
    { id: 'bts-siam', nameTh: 'สยาม', nameEn: 'Siam', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7456, lng: 100.5342 },
    { id: 'bts-chit-lom', nameTh: 'ชิดลม', nameEn: 'Chit Lom', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7441, lng: 100.5430 },
    { id: 'bts-ploen-chit', nameTh: 'เพลินจิต', nameEn: 'Phloen Chit', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7431, lng: 100.5492 },
    { id: 'bts-nana', nameTh: 'นานา', nameEn: 'Nana', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7405, lng: 100.5554 },
    { id: 'bts-asok', nameTh: 'อโศก', nameEn: 'Asok', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7370, lng: 100.5604 },
    { id: 'bts-phrom-phong', nameTh: 'พร้อมพงษ์', nameEn: 'Phrom Phong', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7303, lng: 100.5698 },
    { id: 'bts-thong-lo', nameTh: 'ทองหล่อ', nameEn: 'Thong Lo', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7243, lng: 100.5785 },
    { id: 'bts-ekkamai', nameTh: 'เอกมัย', nameEn: 'Ekkamai', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7194, lng: 100.5852 },
    { id: 'bts-phra-khanong', nameTh: 'พระโขนง', nameEn: 'Phra Khanong', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7153, lng: 100.5912 },
    { id: 'bts-onnut', nameTh: 'อ่อนนุช', nameEn: 'On Nut', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.7057, lng: 100.6010 },
    { id: 'bts-bang-chak', nameTh: 'บางจาก', nameEn: 'Bang Chak', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.6967, lng: 100.6053 },
    { id: 'bts-punnawithi', nameTh: 'ปุณณวิถี', nameEn: 'Punnawithi', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.6893, lng: 100.6092 },
    { id: 'bts-udom-suk', nameTh: 'อุดมสุข', nameEn: 'Udom Suk', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.6800, lng: 100.6097 },
    { id: 'bts-bang-na', nameTh: 'บางนา', nameEn: 'Bang Na', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.6682, lng: 100.6047 },
    { id: 'bts-bearing', nameTh: 'แบริ่ง', nameEn: 'Bearing', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.6606, lng: 100.6012 },
    { id: 'bts-samrong', nameTh: 'สำโรง', nameEn: 'Samrong', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.6475, lng: 100.5960 },
    { id: 'bts-kheha', nameTh: 'เคหะฯ', nameEn: 'Kheha', line: 'BTS สายสุขุมวิท', lineCode: 'BTS_GREEN', lat: 13.5828, lng: 100.6052 },

    // --- BTS สายสีลม (BTS_SILOM) ---
    { id: 'bts-national-stadium', nameTh: 'สนามกีฬาแห่งชาติ', nameEn: 'National Stadium', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7465, lng: 100.5292 },
    { id: 'bts-ratchadamri', nameTh: 'ราชดำริ', nameEn: 'Ratchadamri', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7391, lng: 100.5398 },
    { id: 'bts-sala-daeng', nameTh: 'ศาลาแดง', nameEn: 'Sala Daeng', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7285, lng: 100.5343 },
    { id: 'bts-chong-nonsi', nameTh: 'ช่องนนทรี', nameEn: 'Chong Nonsi', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7238, lng: 100.5297 },
    { id: 'bts-surasak', nameTh: 'สุรศักดิ์', nameEn: 'Surasak', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7193, lng: 100.5218 },
    { id: 'bts-saphan-taksin', nameTh: 'สะพานตากสิน', nameEn: 'Saphan Taksin', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7188, lng: 100.5146 },
    { id: 'bts-krung-thon-buri', nameTh: 'กรุงธนบุรี', nameEn: 'Krung Thon Buri', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7208, lng: 100.5024 },
    { id: 'bts-wongwianyai', nameTh: 'วงเวียนใหญ่', nameEn: 'Wongwian Yai', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7212, lng: 100.4957 },
    { id: 'bts-talat-phlu', nameTh: 'ตลาดพลู', nameEn: 'Talat Phlu', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7138, lng: 100.4770 },
    { id: 'bts-bang-wa', nameTh: 'บางหว้า', nameEn: 'Bang Wa', line: 'BTS สายสีลม', lineCode: 'BTS_SILOM', lat: 13.7207, lng: 100.4578 },

    // --- MRT สายสีน้ำเงิน (MRT_BLUE) ---
    { id: 'mrt-thaphra', nameTh: 'ท่าพระ', nameEn: 'Tha Phra', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7298, lng: 100.4739 },
    { id: 'mrt-bang-khun-non', nameTh: 'บางขุนนนท์', nameEn: 'Bang Khun Non', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7634, lng: 100.4727 },
    { id: 'mrt-bang-plad', nameTh: 'บางพลัด', nameEn: 'Bang Phlat', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7925, lng: 100.5050 },
    { id: 'mrt-bang-pho', nameTh: 'บางโพ', nameEn: 'Bang Pho', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.8062, lng: 100.5209 },
    { id: 'mrt-taopoon-blue', nameTh: 'เตาปูน', nameEn: 'Tao Poon', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.8062, lng: 100.5303 },
    { id: 'mrt-bangsue', nameTh: 'บางซื่อ', nameEn: 'Bang Sue', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.8037, lng: 100.5398 },
    { id: 'mrt-kamphaeng-phet', nameTh: 'กำแพงเพชร', nameEn: 'Kamphaeng Phet', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7978, lng: 100.5484 },
    { id: 'mrt-chatuchak', nameTh: 'สวนจตุจักร', nameEn: 'Chatuchak Park', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.8028, lng: 100.5539 },
    { id: 'mrt-phahon-yothin', nameTh: 'พหลโยธิน', nameEn: 'Phahon Yothin', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.8130, lng: 100.5614 },
    { id: 'mrt-lat-phrao', nameTh: 'ลาดพร้าว', nameEn: 'Lat Phrao', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.8064, lng: 100.5739 },
    { id: 'mrt-sutthisan', nameTh: 'สุทธิสาร', nameEn: 'Sutthisan', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7895, lng: 100.5739 },
    { id: 'mrt-huai-khwang', nameTh: 'ห้วยขวาง', nameEn: 'Huai Khwang', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7788, lng: 100.5736 },
    { id: 'mrt-thailand-cultural-centre', nameTh: 'ศูนย์วัฒนธรรมแห่งประเทศไทย', nameEn: 'Thailand Cultural Centre', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7699, lng: 100.5714 },
    { id: 'mrt-phra-ram-9', nameTh: 'พระราม 9', nameEn: 'Phra Ram 9', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7573, lng: 100.5654 },
    { id: 'mrt-phetchaburi', nameTh: 'เพชรบุรี', nameEn: 'Phetchaburi', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7495, lng: 100.5636 },
    { id: 'mrt-sukhumvit', nameTh: 'สุขุมวิท', nameEn: 'Sukhumvit', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7371, lng: 100.5611 },
    { id: 'mrt-queen-sirikit', nameTh: 'ศูนย์การประชุมแห่งชาติสิริกิติ์', nameEn: 'Queen Sirikit National Convention Centre', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7231, lng: 100.5599 },
    { id: 'mrt-lumphini', nameTh: 'ลุมพินี', nameEn: 'Lumphini', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7258, lng: 100.5458 },
    { id: 'mrt-silom', nameTh: 'สีลม', nameEn: 'Si Lom', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7288, lng: 100.5367 },
    { id: 'mrt-sam-yan', nameTh: 'สามย่าน', nameEn: 'Sam Yan', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7330, lng: 100.5292 },
    { id: 'mrt-hua-lamphong', nameTh: 'หัวลำโพง', nameEn: 'Hua Lamphong', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7374, lng: 100.5186 },
    { id: 'mrt-itsaraphap', nameTh: 'อิสรภาพ', nameEn: 'Itsaraphap', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7370, lng: 100.4890 },
    { id: 'mrt-lak-song', nameTh: 'หลักสอง (เดอะมอลล์บางแค)', nameEn: 'Lak Song', line: 'MRT สายสีน้ำเงิน', lineCode: 'MRT_BLUE', lat: 13.7099, lng: 100.4072 },

    // --- MRT สายสีม่วง (MRT_PURPLE) ---
    { id: 'mrt-khlong-bang-phai', nameTh: 'คลองบางไผ่', nameEn: 'Khlong Bang Phai', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8918, lng: 100.4087 },
    { id: 'mrt-talad-bang-yai', nameTh: 'ตลาดบางใหญ่ (เซ็นทรัลเวสต์เกต)', nameEn: 'Talad Bang Yai', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8778, lng: 100.4124 },
    { id: 'mrt-bang-phlu', nameTh: 'บางพลู', nameEn: 'Bang Phlu', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8753, lng: 100.4343 },
    { id: 'mrt-saimaa', nameTh: 'ไทรม้า', nameEn: 'Sai Ma', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8706, lng: 100.4688 },
    { id: 'mrt-phranangklao', nameTh: 'สะพานพระนั่งเกล้า', nameEn: 'Phra Nang Klao Bridge', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8711, lng: 100.4811 },
    { id: 'mrt-yaek-nonthaburi-1', nameTh: 'แยกนนทบุรี 1 (เซ็นทรัลรัตนาธิเบศร์)', nameEn: 'Yaek Nonthaburi 1', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8659, lng: 100.4975 },
    { id: 'mrt-bang-krasor', nameTh: 'บางกระสอ', nameEn: 'Bang Krasor', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8617, lng: 100.5074 },
    { id: 'mrt-nonthaburi-civic-center', nameTh: 'ศูนย์ราชการนนทบุรี', nameEn: 'Nonthaburi Civic Center', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8601, lng: 100.5173 },
    { id: 'mrt-ministry-of-public-health', nameTh: 'กระทรวงสาธารณสุข', nameEn: 'Ministry of Public Health', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8475, lng: 100.5218 },
    { id: 'mrt-yaek-tiwanon', nameTh: 'แยกติวานนท์', nameEn: 'Yaek Tiwanon', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8398, lng: 100.5256 },
    { id: 'mrt-wongsawang', nameTh: 'วงศ์สว่าง', nameEn: 'Wong Sawang', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8291, lng: 100.5284 },
    { id: 'mrt-bangson', nameTh: 'บางซ่อน', nameEn: 'Bang Son', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8202, lng: 100.5312 },
    { id: 'mrt-taopoon-purple', nameTh: 'เตาปูน', nameEn: 'Tao Poon', line: 'MRT สายสีม่วง', lineCode: 'MRT_PURPLE', lat: 13.8062, lng: 100.5303 },

    // --- MRT สายสีเหลือง (MRT_YELLOW) ---
    { id: 'mrt-yellow-latphrao', nameTh: 'ลาดพร้าว', nameEn: 'Lat Phrao', line: 'MRT สายสีเหลือง', lineCode: 'MRT_YELLOW', lat: 13.8064, lng: 100.5739 },
    { id: 'mrt-chokchai-4', nameTh: 'โชคชัย 4', nameEn: 'Chok Chai 4', line: 'MRT สายสีเหลือง', lineCode: 'MRT_YELLOW', lat: 13.7972, lng: 100.5971 },
    { id: 'mrt-bangkapi', nameTh: 'บางกะปิ', nameEn: 'Bang Kapi', line: 'MRT สายสีเหลือง', lineCode: 'MRT_YELLOW', lat: 13.7663, lng: 100.6441 },
    { id: 'mrt-yaek-lamsali', nameTh: 'แยกลำสาลี', nameEn: 'Yaek Lam Sali', line: 'MRT สายสีเหลือง', lineCode: 'MRT_YELLOW', lat: 13.7601, lng: 100.6473 },
    { id: 'mrt-phatthanakan', nameTh: 'พัฒนาการ', nameEn: 'Phatthanakan', line: 'MRT สายสีเหลือง', lineCode: 'MRT_YELLOW', lat: 13.7346, lng: 100.6465 },
    { id: 'mrt-suanluang-rama9', nameTh: 'สวนหลวง ร.9 (ซีคอนสแควร์)', nameEn: 'Suan Luang Rama IX', line: 'MRT สายสีเหลือง', lineCode: 'MRT_YELLOW', lat: 13.6934, lng: 100.6481 },
    { id: 'mrt-sri-iam', nameTh: 'ศรีเอี่ยม (เซ็นทรัลบางนา)', nameEn: 'Si Iam', line: 'MRT สายสีเหลือง', lineCode: 'MRT_YELLOW', lat: 13.6664, lng: 100.6475 },
    { id: 'mrt-samrong-yellow', nameTh: 'สำโรง', nameEn: 'Samrong', line: 'MRT สายสีเหลือง', lineCode: 'MRT_YELLOW', lat: 13.6475, lng: 100.5960 },

    // --- MRT สายสีชมพู (MRT_PINK) ---
    { id: 'mrt-nonthaburi-pink', nameTh: 'ศูนย์ราชการนนทบุรี', nameEn: 'Nonthaburi Civic Center', line: 'MRT สายสีชมพู', lineCode: 'MRT_PINK', lat: 13.8601, lng: 100.5173 },
    { id: 'mrt-pak-kret', nameTh: 'แยกปากเกร็ด', nameEn: 'Yaek Pak Kret', line: 'MRT สายสีชมพู', lineCode: 'MRT_PINK', lat: 13.9079, lng: 100.5028 },
    { id: 'mrt-chaeng-watthana-28', nameTh: 'แจ้งวัฒนะ-ปากเกร็ด 28 (เซ็นทรัลแจ้งวัฒนะ)', nameEn: 'Chaeng Watthana - Pak Kret 28', line: 'MRT สายสีชมพู', lineCode: 'MRT_PINK', lat: 13.9037, lng: 100.5284 },
    { id: 'mrt-muang-thong-thani', nameTh: 'เมืองทองธานี', nameEn: 'Muang Thong Thani', line: 'MRT สายสีชมพู', lineCode: 'MRT_PINK', lat: 13.8967, lng: 100.5489 },
    { id: 'mrt-government-complex', nameTh: 'ศูนย์ราชการเฉลิมพระเกียรติ', nameEn: 'Government Complex', line: 'MRT สายสีชมพู', lineCode: 'MRT_PINK', lat: 13.8867, lng: 100.5658 },
    { id: 'mrt-lak-si', nameTh: 'หลักสี่', nameEn: 'Lak Si', line: 'MRT สายสีชมพู', lineCode: 'MRT_PINK', lat: 13.8829, lng: 100.5824 },
    { id: 'mrt-wat-phra-sri', nameTh: 'วัดพระศรีมหาธาตุ', nameEn: 'Wat Phra Sri Mahathat', line: 'MRT สายสีชมพู', lineCode: 'MRT_PINK', lat: 13.8752, lng: 100.5968 },
    { id: 'mrt-minburi', nameTh: 'มีนบุรี', nameEn: 'Min Buri', line: 'MRT สายสีชมพู', lineCode: 'MRT_PINK', lat: 13.8138, lng: 100.7224 },

    // --- SRT สายสีแดง (SRT_RED) ---
    { id: 'srt-krungthep-aphiwat', nameTh: 'กรุงเทพอภิวัฒน์ (กลางบางซื่อ)', nameEn: 'Krung Thep Aphiwat Central Terminal', line: 'SRT สายสีแดง', lineCode: 'SRT_RED', lat: 13.8037, lng: 100.5398 },
    { id: 'srt-don-mueang', nameTh: 'ดอนเมือง (สนามบิน)', nameEn: 'Don Mueang', line: 'SRT สายสีแดง', lineCode: 'SRT_RED', lat: 13.9130, lng: 100.6012 },
    { id: 'srt-rangsit', nameTh: 'รังสิต', nameEn: 'Rangsit', line: 'SRT สายสีแดง', lineCode: 'SRT_RED', lat: 13.9889, lng: 100.6033 },

    // --- Airport Rail Link (ARL) ---
    { id: 'arl-phaya-thai', nameTh: 'พญาไท', nameEn: 'Phaya Thai', line: 'Airport Rail Link', lineCode: 'ARL', lat: 13.7569, lng: 100.5348 },
    { id: 'arl-makkasan', nameTh: 'มักกะสัน', nameEn: 'Makkasan', line: 'Airport Rail Link', lineCode: 'ARL', lat: 13.7508, lng: 100.5614 },
    { id: 'arl-suvarnabhumi', nameTh: 'สุวรรณภูมิ', nameEn: 'Suvarnabhumi', line: 'Airport Rail Link', lineCode: 'ARL', lat: 13.6931, lng: 100.7511 }
];

/**
 * คัดเลือกสถานีรถไฟฟ้า/รถไฟที่ใกล้ที่สุดตามลำดับ (Top N Nearby Transit Stations)
 * กรองเฉพาะสถานีที่มีระยะทางไม่เกิน maxDistanceKm (ค่าเริ่มต้น 20 กม.)
 */
export function findTopNearbyTransitStations(
    centerLat: number,
    centerLng: number,
    limit: number = 3,
    maxDistanceKm: number = 20
): NearbyTransitStation[] {
    if (!centerLat || !centerLng || isNaN(Number(centerLat)) || isNaN(Number(centerLng))) {
        return [];
    }

    const cLat = Number(centerLat);
    const cLng = Number(centerLng);
    if (cLat === 0 && cLng === 0) {
        return [];
    }

    return TRANSIT_STATIONS
        .filter(st => st.lat && st.lng)
        .map(station => ({
            station,
            distanceKm: calculateHaversineDistance(cLat, cLng, station.lat, station.lng),
        }))
        .filter(item => item.distanceKm <= maxDistanceKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, limit)
        .map((item, index) => ({
            station: item.station,
            distanceKm: item.distanceKm,
            priorityOrder: index + 1,
        }));
}
