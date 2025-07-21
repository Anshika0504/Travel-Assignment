const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

// Safely segregate activities into morning, afternoon, evening
const segregateActivities = (activities) => {
  const result = { morning: [], afternoon: [], evening: [] };

  if (!Array.isArray(activities)) {
    console.error('Invalid format for activities. Expected an array, got:', typeof activities);
    return result;
  }

  activities.forEach(({ time, description }) => {
    if (!time || !description) return; // Skip invalid entries
    const [hour] = time.split(':').map(Number);
    const activity = { time, description };

    if (hour >= 5 && hour < 12) result.morning.push(activity);
    else if (hour >= 12 && hour < 18) result.afternoon.push(activity);
    else result.evening.push(activity);
  });

  return result;
};

const generateItineraryPDF = async (req, res) => {
  try {
    const {
      title,
      name,
      source,
      destination,
      members,
      arrivalDate,
      departureDate,
      travelDays,
      days
    } = req.body;

    if (!Array.isArray(days)) {
      return res.status(400).json({ message: 'Invalid format for days. Expected an array.' });
    }

    const structuredDays = days.map(day => {
      const parts = segregateActivities(day.activities);
      return { date: day.date, ...parts };
    });

    const html = await ejs.renderFile(
      path.join(__dirname, '../views/template.ejs'),
      {
        title, name, source, destination, members,
        arrivalDate, departureDate, travelDays,
        days: structuredDays
      }
    );

    const pdfPath = path.join(__dirname, '../pdfs/', `${title.replace(/\s+/g, '_')}_itinerary.pdf`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: pdfPath, format: 'A4' });
    await browser.close();

    res.status(200).json({
      message: 'PDF generated successfully',
      pdfUrl: `/pdfs/${path.basename(pdfPath)}`
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Failed to generate itinerary' });
  }
};

module.exports = { generateItineraryPDF };
