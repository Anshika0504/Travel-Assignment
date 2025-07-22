const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');

exports.createItinerary = async (req, res) => {
  try {
    const data = req.body;

    const segregatedDays = data.days.map((day) => {
      const allActivities = [];

      if (day.activities) {
        allActivities.push(...day.activities);
      }

      if (day.flights) {
        day.flights.forEach((flight) => {
          const flightActivity = {
            time: flight.time,
            description: `Flight from ${data.source} to ${data.destination} - ${flight.description || ''}`,
          };
          allActivities.push(flightActivity);
        });
      }

      const segregated = {
        morning: [],
        afternoon: [],
        evening: [],
      };

      allActivities.forEach((act) => {
        if (act.time && typeof act.time === 'string' && act.time.includes(':')) {
          const hour = parseInt(act.time.split(':')[0], 10);
          if (!isNaN(hour)) {
            if (hour >= 5 && hour < 12) segregated.morning.push(act);
            else if (hour >= 12 && hour < 17) segregated.afternoon.push(act);
            else segregated.evening.push(act);
          }
        }
      });

      return {
        date: day.date,
        activities: segregated,
        flights: day.flights || [],
      };
    });

    const templatePath = path.join(__dirname, '../views/template.ejs');
    const html = await ejs.renderFile(templatePath, {
      ...data,
      days: segregatedDays,
      hotels: data.hotels || [],
      extraActivities: data.extraActivities || [],
    });

    const uniqueFilename = `itinerary-${uuidv4()}.pdf`;
    const pdfPath = path.join(__dirname, `../pdfs/${uniqueFilename}`);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: pdfPath, format: 'A4' });
    await browser.close();

    res.download(pdfPath);
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).send('Error generating itinerary PDF');
  }
};
