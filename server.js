/* eslint-disable @typescript-eslint/no-require-imports */
// server.js (Custom Next.js Server)

// --- 1. Import Library ที่จำเป็น ---
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const next = require('next');

// --- 2. ตั้งค่า Next.js App ---
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const PORT = process.env.PORT || 3000;

// --- 3. ตั้งค่า Database Paths ---
const DB_PATH = path.join(__dirname, 'db.json');
const CONSULTATIONS_PATH = path.join(__dirname, 'consultations.json');

// --- 4. ฟังก์ชันจัดการไฟล์ฐานข้อมูล (File DB Handlers) ---
let careCenters = [];
let consultations = [];

/**
 * โหลดข้อมูล JSON จาก Path ที่กำหนด
 * @param {string} filePath - ที่อยู่ไฟล์
 * @returns {Array<any>} ข้อมูลที่โหลดได้
 */
const loadDataFromFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            // เพิ่มการตรวจสอบกรณีไฟล์ว่าง
            return data.trim() ? JSON.parse(data) : [];
        }
        return [];
    } catch (error) {
        console.error(`Error reading file ${path.basename(filePath)}:`, error);
        return [];
    }
};

/**
 * บันทึกข้อมูล Array ลงในไฟล์ JSON
 * @param {string} filePath - ที่อยู่ไฟล์
 * @param {Array<any>} data - ข้อมูลที่ต้องการบันทึก
 */
const saveDataToFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing to file ${path.basename(filePath)}:`, error);
    }
};

// --- 5. เริ่มต้น Next.js และ Express ---
nextApp.prepare().then(() => {
    const app = express();

    // โหลดข้อมูลเริ่มต้น
    careCenters = loadDataFromFile(DB_PATH);
    consultations = loadDataFromFile(CONSULTATIONS_PATH);

    // หา ID ถัดไปสำหรับ Care Centers
    let nextCenterId = careCenters.length > 0
        ? Math.max(...careCenters.map(c => c.id)) + 1
        : 1;

    // --- 6. ใช้ Middleware ---
    app.use(cors());
    app.use(express.json());

    // ==========================================
    // ส่วนที่ 7: API Endpoints (Routes)
    // ==========================================

    // --- 7.1 API: Consultations ---

    app.post('/api/care-centers/consultations', (req, res) => {
        try {
            const {
                name, phone, roomType, branch, budget, convenientTime,
                lineId, email, message
            } = req.body;

            if (!name || !phone || !roomType || !branch || !budget || !convenientTime) {
                return res.status(400).json({
                    success: false,
                    message: 'กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบถ้วน'
                });
            }

            const newConsultation = {
                id: Date.now(),
                name,
                phone,
                lineId: lineId || '',
                email: email || '',
                roomType,
                branch,
                budget,
                convenientTime,
                message: message || '',
                status: 'pending',
                submittedAt: new Date().toISOString()
            };

            consultations.push(newConsultation);
            saveDataToFile(CONSULTATIONS_PATH, consultations);

            res.status(201).json({
                success: true,
                message: 'บันทึกข้อมูลการนัดหมายเรียบร้อยแล้ว',
                data: newConsultation
            });

        } catch (error) {
            console.error('Error processing consultation POST:', error);
            res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
        }
    });

    app.get('/api/care-centers/consultations', (req, res) => {
        res.status(200).json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    });

    app.put('/api/care-centers/consultations/:id', (req, res) => {
        const id = Number(req.params.id);
        const index = consultations.findIndex(c => c.id === id);

        if (index !== -1) {
            consultations[index] = { ...consultations[index], ...req.body, id: id };
            saveDataToFile(CONSULTATIONS_PATH, consultations);

            res.status(200).json({
                success: true,
                message: `อัปเดตรายการ ID ${id} สำเร็จ`,
                data: consultations[index]
            });
        } else {
            res.status(404).json({ success: false, message: 'ไม่พบรายการปรึกษา' });
        }
    });

    app.delete('/api/care-centers/consultations/:id', (req, res) => {
        const id = Number(req.params.id);
        const index = consultations.findIndex(c => c.id === id);

        if (index !== -1) {
            consultations.splice(index, 1);
            saveDataToFile(CONSULTATIONS_PATH, consultations);
            res.status(204).send();
        } else {
            res.status(404).json({ success: false, message: 'ไม่พบรายการปรึกษา' });
        }
    });


    // --- 7.3 API: Care Centers ---

    app.get('/api/care-centers', (req, res) => {
        res.status(200).json(careCenters);
    });

    app.get('/api/care-centers/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const center = careCenters.find(c => c.id === id);
        if (center) {
            res.status(200).json(center);
        } else {
            res.status(404).json({ message: 'Center not found' });
        }
    });

    app.post('/api/care-centers', (req, res) => {
        const newCenter = {
            id: nextCenterId++,
            ...req.body
        };
        careCenters.push(newCenter);
        saveDataToFile(DB_PATH, careCenters);
        res.status(201).json(newCenter);
    });

    app.put('/api/care-centers/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const index = careCenters.findIndex(c => c.id === id);
        if (index !== -1) {
            careCenters[index] = { ...careCenters[index], ...req.body, id: id };
            saveDataToFile(DB_PATH, careCenters);
            res.status(200).json(careCenters[index]);
        } else {
            res.status(404).json({ message: 'Center not found' });
        }
    });

    app.delete('/api/care-centers/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const index = careCenters.findIndex(c => c.id === id);
        if (index !== -1) {
            careCenters.splice(index, 1);
            saveDataToFile(DB_PATH, careCenters);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Center not found' });
        }
    });

    // --- 8. Next.js Request Handler (Catch-all) ---
    // ใช้ app.all(/(.*)/) เพื่อให้รองรับ Express 5 และให้ Next.js จัดการทุก Request
    app.all(/(.*)/, (req, res) => {
        return handle(req, res);
    });

    // --- 9. Start Server ---
    app.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`✅ Server is running on http://localhost:${PORT}`);
        console.log(`- API: http://localhost:${PORT}/api/...`);
        console.log(`- Web: http://localhost:${PORT}`);
    });
});



// pm2 delete yoodee-server

// pm2 start server.js --name "yoodee-server" --node-args="--max-old-space-size=2048" -- env "NODE_ENV=production"

// pm2 status

//pm2 logs yoodee-server