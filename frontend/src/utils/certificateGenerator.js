// Professional Certificate Generator - Gold Shiny Design
// Creates high-quality downloadable certificates for achievements and K9 credentials

export const generateGoldCertificate = (ctx, canvas, certData) => {
  const width = canvas.width;
  const height = canvas.height;
  
  // Rich dark background
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(0.5, '#16213e');
  bgGradient.addColorStop(1, '#0f0f23');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Gold shimmer overlay pattern
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2;
    const alpha = Math.random() * 0.1;
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Ornate gold border - outer
  const goldGradient = ctx.createLinearGradient(0, 0, width, 0);
  goldGradient.addColorStop(0, '#b8860b');
  goldGradient.addColorStop(0.25, '#ffd700');
  goldGradient.addColorStop(0.5, '#ffec8b');
  goldGradient.addColorStop(0.75, '#ffd700');
  goldGradient.addColorStop(1, '#b8860b');
  
  ctx.strokeStyle = goldGradient;
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Inner decorative border
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);
  
  // Double inner border
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, width - 100, height - 100);
  
  // Corner ornaments
  drawCornerOrnament(ctx, 60, 60, 40, goldGradient); // Top-left
  drawCornerOrnament(ctx, width - 60, 60, 40, goldGradient, true, false); // Top-right
  drawCornerOrnament(ctx, 60, height - 60, 40, goldGradient, false, true); // Bottom-left
  drawCornerOrnament(ctx, width - 60, height - 60, 40, goldGradient, true, true); // Bottom-right
  
  return goldGradient;
};

const drawCornerOrnament = (ctx, x, y, size, gradient, flipH = false, flipV = false) => {
  ctx.save();
  ctx.translate(x, y);
  if (flipH) ctx.scale(-1, 1);
  if (flipV) ctx.scale(1, -1);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  
  // Draw decorative corner lines
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.stroke();
  
  // Inner curves
  ctx.beginPath();
  ctx.moveTo(8, size - 8);
  ctx.quadraticCurveTo(8, 8, size - 8, 8);
  ctx.stroke();
  
  ctx.restore();
};

export const generateK9Certificate = (certData, userName) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  
  // Apply gold certificate base
  const goldGradient = generateGoldCertificate(ctx, canvas, certData);
  
  // Shield emblem with glow
  const centerX = 700;
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 30;
  
  // Shield background
  ctx.fillStyle = certData.tier_color || '#ffd700';
  drawShield(ctx, centerX, 180, 70, 90);
  
  // Shield icon
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛡️', centerX, 195);
  
  // Header laurels
  ctx.fillStyle = goldGradient;
  ctx.font = '30px Arial';
  ctx.fillText('🏅', centerX - 150, 120);
  ctx.fillText('🏅', centerX + 150, 120);
  
  // Organization header
  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.font = 'bold 14px Arial';
  ctx.letterSpacing = '8px';
  ctx.fillText('CANINECOMPASS K9 PROTECTION ACADEMY', centerX, 290);
  
  // Main title with gold gradient
  ctx.fillStyle = goldGradient;
  ctx.font = 'bold 48px Georgia';
  ctx.fillText('CERTIFICATE', centerX, 350);
  ctx.font = 'bold 32px Georgia';
  ctx.fillText('OF PROFESSIONAL K9 HANDLER', centerX, 395);
  
  // Decorative line
  drawDecorativeLine(ctx, centerX, 420, 400, goldGradient);
  
  // Certifies text
  ctx.fillStyle = '#c9c9c9';
  ctx.font = 'italic 18px Georgia';
  ctx.fillText('This official document certifies that', centerX, 470);
  
  // Recipient name with emphasis
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px Georgia';
  ctx.fillText(certData.holder_name || userName || 'K9 Handler', centerX, 530);
  ctx.shadowBlur = 0;
  
  // Credential text
  ctx.fillStyle = '#c9c9c9';
  ctx.font = '18px Georgia';
  ctx.fillText('has demonstrated exceptional skill and dedication to achieve the rank of', centerX, 580);
  
  // Tier/Rank name
  ctx.fillStyle = certData.tier_color || '#ffd700';
  ctx.font = 'bold 38px Georgia';
  ctx.fillText(certData.tier_name || 'CERTIFIED K9 HANDLER', centerX, 640);
  
  // Lessons and details
  ctx.fillStyle = '#888888';
  ctx.font = '16px Arial';
  ctx.fillText(`Successfully completed ${certData.lessons_completed || 0} K9 Security & Protection Training Modules`, centerX, 690);
  
  // Credential ID box
  ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
  ctx.fillRect(centerX - 150, 720, 300, 40);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(centerX - 150, 720, 300, 40);
  
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`CREDENTIAL ID: ${certData.credential_id || 'K9-0000-0000'}`, centerX, 745);
  
  // Issue date
  ctx.fillStyle = '#666666';
  ctx.font = '14px Arial';
  ctx.fillText(`Issued: ${certData.issued_date || new Date().toLocaleDateString()}`, centerX, 800);
  
  // Seal/Stamp
  drawOfficialSeal(ctx, 200, 750, goldGradient);
  drawOfficialSeal(ctx, 1200, 750, goldGradient);
  
  // Footer
  ctx.fillStyle = goldGradient;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('CANINECOMPASS™', centerX, 860);
  ctx.fillStyle = '#666666';
  ctx.font = '12px Arial';
  ctx.fillText('Professional K9 Training & Certification', centerX, 880);
  
  return canvas;
};

export const generateAchievementCertificate = (achievement, userName) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  // Apply gold certificate base
  const goldGradient = generateGoldCertificate(ctx, canvas, achievement);
  
  const centerX = 600;
  
  // Badge glow effect
  ctx.shadowColor = getBadgeColor(achievement.badge_type);
  ctx.shadowBlur = 40;
  
  // Achievement badge circle
  ctx.fillStyle = getBadgeColor(achievement.badge_type);
  ctx.beginPath();
  ctx.arc(centerX, 150, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Badge icon
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(getBadgeIcon(achievement.category), centerX, 165);
  
  // Badge type label
  ctx.fillStyle = getBadgeColor(achievement.badge_type);
  ctx.font = 'bold 14px Arial';
  ctx.fillText(achievement.badge_type?.toUpperCase() || 'ACHIEVEMENT', centerX, 220);
  
  // Header
  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('CANINECOMPASS TRAINING ACADEMY', centerX, 260);
  
  // Main title
  ctx.fillStyle = goldGradient;
  ctx.font = 'bold 40px Georgia';
  ctx.fillText('CERTIFICATE OF ACHIEVEMENT', centerX, 310);
  
  // Decorative line
  drawDecorativeLine(ctx, centerX, 335, 350, goldGradient);
  
  // Awarded to text
  ctx.fillStyle = '#c9c9c9';
  ctx.font = 'italic 16px Georgia';
  ctx.fillText('Proudly presented to', centerX, 380);
  
  // Recipient name
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Georgia';
  ctx.fillText(userName || 'Dog Parent', centerX, 430);
  ctx.shadowBlur = 0;
  
  // For achieving
  ctx.fillStyle = '#c9c9c9';
  ctx.font = '16px Georgia';
  ctx.fillText('for successfully achieving the badge', centerX, 480);
  
  // Achievement title
  ctx.fillStyle = getBadgeColor(achievement.badge_type);
  ctx.font = 'bold 32px Georgia';
  ctx.fillText(`"${achievement.title}"`, centerX, 530);
  
  // Description
  ctx.fillStyle = '#888888';
  ctx.font = '14px Arial';
  ctx.fillText(achievement.description || '', centerX, 575);
  
  // Category badge
  ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
  ctx.fillRect(centerX - 80, 600, 160, 30);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 12px Arial';
  ctx.fillText(`CATEGORY: ${achievement.category?.toUpperCase() || 'GENERAL'}`, centerX, 620);
  
  // Date
  ctx.fillStyle = '#666666';
  ctx.font = '14px Arial';
  const earnedDate = achievement.earned_at ? new Date(achievement.earned_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : new Date().toLocaleDateString();
  ctx.fillText(`Awarded on ${earnedDate}`, centerX, 680);
  
  // Seals
  drawOfficialSeal(ctx, 150, 680, goldGradient);
  drawOfficialSeal(ctx, 1050, 680, goldGradient);
  
  // Footer
  ctx.fillStyle = goldGradient;
  ctx.font = 'bold 14px Arial';
  ctx.fillText('CANINECOMPASS™', centerX, 760);
  
  return canvas;
};

const drawShield = (ctx, x, y, width, height) => {
  ctx.beginPath();
  ctx.moveTo(x, y - height/2);
  ctx.lineTo(x + width/2, y - height/3);
  ctx.lineTo(x + width/2, y + height/4);
  ctx.quadraticCurveTo(x, y + height/2, x, y + height/2);
  ctx.quadraticCurveTo(x, y + height/2, x - width/2, y + height/4);
  ctx.lineTo(x - width/2, y - height/3);
  ctx.closePath();
  ctx.fill();
};

const drawDecorativeLine = (ctx, x, y, length, gradient) => {
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  
  // Center diamond
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x, y - 8);
  ctx.lineTo(x + 8, y);
  ctx.lineTo(x, y + 8);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Lines
  ctx.beginPath();
  ctx.moveTo(x - length/2, y);
  ctx.lineTo(x - 15, y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x + 15, y);
  ctx.lineTo(x + length/2, y);
  ctx.stroke();
  
  // End caps
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x - length/2, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + length/2, y, 4, 0, Math.PI * 2);
  ctx.fill();
};

const drawOfficialSeal = (ctx, x, y, gradient) => {
  // Outer ring
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 45, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner ring
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 38, 0, Math.PI * 2);
  ctx.stroke();
  
  // Rays
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    const innerR = 40;
    const outerR = 48;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * innerR, y + Math.sin(angle) * innerR);
    ctx.lineTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR);
    ctx.stroke();
  }
  
  // Center
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Star
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('★', x, y + 7);
};

const getBadgeColor = (badgeType) => {
  switch(badgeType) {
    case 'gold': return '#ffd700';
    case 'silver': return '#c0c0c0';
    case 'bronze': return '#cd7f32';
    default: return '#ffd700';
  }
};

const getBadgeIcon = (category) => {
  switch(category) {
    case 'training': return '🎓';
    case 'health': return '❤️';
    case 'social': return '🤝';
    case 'milestone': return '⭐';
    default: return '🏆';
  }
};

// Download function
export const downloadCertificate = (canvas, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
};

// Share function
export const shareCertificate = async (canvas, title, text) => {
  try {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], 'certificate.png', { type: 'image/png' });
    
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file]
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title,
        text,
        url: window.location.href
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error('Share failed:', e);
    return false;
  }
};
