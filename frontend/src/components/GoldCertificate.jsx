import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Download,
  Share2,
  Eye,
  Award,
  Shield,
  Star,
  CheckCircle,
  ExternalLink
} from "lucide-react";

// Gold Certificate Component - Creates professional-looking downloadable certificates
export const GoldCertificate = ({
  type = "achievement", // "achievement" | "k9" | "training"
  title,
  recipientName,
  description,
  date,
  credentialId,
  tier,
  tierColor,
  lessonsCompleted,
  verificationUrl,
  badgeType = "gold"
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  const getBadgeGradient = () => {
    switch (badgeType) {
      case "gold":
        return "from-yellow-300 via-amber-400 to-yellow-600";
      case "silver":
        return "from-gray-300 via-gray-400 to-gray-500";
      case "bronze":
        return "from-amber-600 via-orange-500 to-amber-700";
      default:
        return "from-yellow-300 via-amber-400 to-yellow-600";
    }
  };

  const generateCertificateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    const width = 1200;
    const height = 850;

    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#fef9c3");
    bgGradient.addColorStop(0.5, "#fef08a");
    bgGradient.addColorStop(1, "#fde047");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative border
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 35, width - 70, height - 70);

    // Gold corners decoration
    const cornerSize = 60;
    ctx.fillStyle = "#b45309";
    // Top-left
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20 + cornerSize, 20);
    ctx.lineTo(20, 20 + cornerSize);
    ctx.fill();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 20, 20);
    ctx.lineTo(width - 20 - cornerSize, 20);
    ctx.lineTo(width - 20, 20 + cornerSize);
    ctx.fill();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(20, height - 20);
    ctx.lineTo(20 + cornerSize, height - 20);
    ctx.lineTo(20, height - 20 - cornerSize);
    ctx.fill();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 20, height - 20);
    ctx.lineTo(width - 20 - cornerSize, height - 20);
    ctx.lineTo(width - 20, height - 20 - cornerSize);
    ctx.fill();

    // Header with shield/badge icon
    ctx.fillStyle = "#78350f";
    ctx.font = "bold 24px serif";
    ctx.textAlign = "center";
    ctx.fillText("CANINECOMPASS", width / 2, 80);

    // Certificate of Achievement/Completion text
    ctx.fillStyle = "#b45309";
    ctx.font = "italic 28px Georgia, serif";
    ctx.fillText(
      type === "k9" ? "K9 Handler Credential" : "Certificate of Achievement",
      width / 2,
      130
    );

    // Main Title
    ctx.fillStyle = "#78350f";
    ctx.font = "bold 56px Georgia, serif";
    const titleLines = wrapText(ctx, title, width - 200, 56);
    let yPos = 200;
    titleLines.forEach((line) => {
      ctx.fillText(line, width / 2, yPos);
      yPos += 65;
    });

    // "This certifies that" text
    ctx.fillStyle = "#92400e";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillText("This certifies that", width / 2, yPos + 30);

    // Recipient Name
    ctx.fillStyle = "#78350f";
    ctx.font = "bold 48px Georgia, serif";
    ctx.fillText(recipientName || "Outstanding Handler", width / 2, yPos + 90);

    // Description
    ctx.fillStyle = "#a16207";
    ctx.font = "20px Georgia, serif";
    const descLines = wrapText(ctx, description || "Has demonstrated exceptional skill and dedication", width - 300, 20);
    let descY = yPos + 140;
    descLines.forEach((line) => {
      ctx.fillText(line, width / 2, descY);
      descY += 28;
    });

    // Tier/Level badge (for K9 credentials)
    if (tier) {
      ctx.fillStyle = tierColor || "#eab308";
      ctx.beginPath();
      ctx.arc(width / 2, descY + 50, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px serif";
      ctx.fillText(tier, width / 2, descY + 62);

      ctx.fillStyle = "#78350f";
      ctx.font = "16px Georgia, serif";
      ctx.fillText(`Level ${tier} Certification`, width / 2, descY + 110);
    }

    // Seal area
    const sealY = height - 180;
    
    // Gold seal
    ctx.beginPath();
    ctx.arc(width / 2, sealY, 55, 0, Math.PI * 2);
    const sealGradient = ctx.createRadialGradient(width / 2, sealY, 0, width / 2, sealY, 55);
    sealGradient.addColorStop(0, "#fde047");
    sealGradient.addColorStop(0.7, "#eab308");
    sealGradient.addColorStop(1, "#b45309");
    ctx.fillStyle = sealGradient;
    ctx.fill();

    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Star in seal
    drawStar(ctx, width / 2, sealY, 5, 30, 15, "#78350f");

    // Date and Credential ID
    ctx.fillStyle = "#78350f";
    ctx.font = "16px Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillText(`Date: ${date || new Date().toLocaleDateString()}`, 80, height - 80);
    
    ctx.textAlign = "right";
    ctx.fillText(`ID: ${credentialId || "CC-" + Math.random().toString(36).substring(2, 10).toUpperCase()}`, width - 80, height - 80);

    // Verification URL
    if (verificationUrl) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#92400e";
      ctx.font = "italic 14px Georgia, serif";
      ctx.fillText(`Verify at: ${verificationUrl}`, width / 2, height - 50);
    }

    return canvas;
  };

  // Helper function to wrap text
  const wrapText = (ctx, text, maxWidth, fontSize) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Helper function to draw star
  const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius, color) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const canvas = generateCertificateCanvas();
      if (!canvas) throw new Error("Failed to generate certificate");

      const link = document.createElement("a");
      link.download = `${type}-certificate-${credentialId || Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.error("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  const shareCertificate = async () => {
    const shareText = `I earned the "${title}" ${type === "k9" ? "K9 Handler Credential" : "Achievement"} on CanineCompass! ${verificationUrl ? `Verify: ${verificationUrl}` : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: verificationUrl || window.location.origin
        });
      } catch (e) {
        if (e.name !== "AbortError") {
          await navigator.clipboard.writeText(shareText);
          toast.success("Share text copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  const openPreview = () => {
    setPreviewOpen(true);
    setTimeout(() => generateCertificateCanvas(), 100);
  };

  return (
    <>
      {/* Certificate Preview Card */}
      <div 
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getBadgeGradient()} p-1 cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-xl`}
        onClick={openPreview}
        data-testid="gold-certificate"
      >
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-6">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-400/30 to-transparent rounded-bl-full"></div>
          
          {/* Badge Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getBadgeGradient()} shadow-lg`}>
              {type === "k9" ? (
                <Shield className="w-8 h-8 text-amber-900" />
              ) : (
                <Award className="w-8 h-8 text-amber-900" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={(e) => { e.stopPropagation(); openPreview(); }}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/50 hover:bg-white"
              >
                <Eye className="w-4 h-4 text-amber-700" />
              </Button>
              <Button
                onClick={(e) => { e.stopPropagation(); downloadCertificate(); }}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/50 hover:bg-white"
                disabled={downloading}
              >
                {downloading ? (
                  <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-amber-700" />
                )}
              </Button>
              <Button
                onClick={(e) => { e.stopPropagation(); shareCertificate(); }}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/50 hover:bg-white"
              >
                <Share2 className="w-4 h-4 text-amber-700" />
              </Button>
            </div>
          </div>

          {/* Certificate Info */}
          <h3 className="font-bold text-xl text-amber-900 mb-1">{title}</h3>
          <p className="text-amber-700 text-sm mb-3">{description}</p>

          {/* Recipient & Date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <CheckCircle className="w-4 h-4" />
              <span>{recipientName}</span>
            </div>
            <span className="text-amber-600">{date}</span>
          </div>

          {/* Tier Badge */}
          {tier && (
            <div className="mt-4 flex items-center justify-center">
              <div 
                className="px-4 py-2 rounded-full font-bold text-white shadow-lg"
                style={{ backgroundColor: tierColor || "#eab308" }}
              >
                <Star className="w-4 h-4 inline mr-1" />
                Level {tier} - {lessonsCompleted} Lessons
              </div>
            </div>
          )}

          {/* Click to preview hint */}
          <p className="text-center text-xs text-amber-600 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to preview full certificate
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Certificate Preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <canvas 
              ref={canvasRef} 
              className="w-full rounded-lg shadow-xl"
              style={{ maxWidth: "100%", height: "auto" }}
            />
            
            <div className="flex gap-3 mt-6 justify-center">
              <Button
                onClick={downloadCertificate}
                disabled={downloading}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 rounded-full"
              >
                {downloading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Certificate
              </Button>
              <Button
                onClick={shareCertificate}
                variant="outline"
                className="rounded-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {verificationUrl && (
                <Button
                  onClick={() => window.open(verificationUrl, "_blank")}
                  variant="outline"
                  className="rounded-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Verify
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoldCertificate;
