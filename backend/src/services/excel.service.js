const ExcelJS = require('exceljs');
const db = require('../config/db.config');

class ExcelService {
  
  async parseFrequentation(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.worksheets[0];
    const frequentations = [];
    
    // Commencer à la ligne 3 (en-têtes sont généralement en 1-2)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < 3) return; // Ignorer les lignes d'en-tête
      
      const pdvId = row.getCell('E').value?.toString(); // Numéro PDV
      const jour = row.getCell('G').value?.toString(); // Jour
      const trancheHoraire = row.getCell('H').value?.toString(); // Tranche horaire
      const ticketsSem1 = Number(row.getCell('N').value); // Total tickets S-1
      const ticketsSem1A1 = Number(row.getCell('T').value); // Total tickets S-1A-1
      const ticketsSem2 = Number(row.getCell('Z').value); // Total tickets S-2
      
      if (pdvId && jour && trancheHoraire) {
        frequentations.push({
          pdv_id: pdvId,
          jour,
          tranche_horaire: trancheHoraire,
          tickets_sem1: ticketsSem1,
          tickets_sem1a1: ticketsSem1A1,
          tickets_sem2: ticketsSem2,
          semaine: this.getCurrentWeekNumber()
        });
      }
    });
    
    return frequentations;
  }
  
  async parseHistoriqueVentes(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.worksheets[0];
    const ventes = [];
    
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < 2) return; // Ignorer la ligne d'en-tête
      
      const produit = row.getCell('C').value?.toString(); // Libellé produit
      const dateStr = row.getCell('D').value; // Date de vente
      const quantite = Number(row.getCell('E').value); // Quantité vendue
      
      // Convertir la date en format de date JavaScript
      let date;
      if (typeof dateStr === 'string') {
        // Format JJ/MM/AAAA
        const [jour, mois, annee] = dateStr.split('/');
        date = new Date(`${annee}-${mois}-${jour}`);
      } else if (dateStr instanceof Date) {
        date = dateStr;
      }
      
      if (produit && date && !isNaN(quantite)) {
        ventes.push({
          produit,
          date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
          quantite
        });
      }
    });
    
    return ventes;
  }
  
  getCurrentWeekNumber() {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  
  async saveFrequentationToDb(frequentations) {
    const trx = await db.transaction();
    try {
      // Insertion des données de fréquentation
      await Promise.all(frequentations.map(async (item) => {
        const pdvExists = await trx('pdv').where('numero', item.pdv_id).first();
        
        if (!pdvExists) {
          await trx('pdv').insert({
            numero: item.pdv_id,
            nom: `Point de vente ${item.pdv_id}`
          });
        }
        
        const pdv = await trx('pdv').where('numero', item.pdv_id).first();
        
        await trx('frequentation').insert({
          pdv_id: pdv.id,
          semaine: item.semaine,
          jour: item.jour,
          tranche_horaire: item.tranche_horaire,
          tickets_sem1: item.tickets_sem1,
          tickets_sem1a1: item.tickets_sem1a1,
          tickets_sem2: item.tickets_sem2
        });
      }));
      
      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = new ExcelService();
