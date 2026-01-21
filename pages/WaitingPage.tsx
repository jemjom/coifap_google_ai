
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, User, Armchair, ChevronLeft, RefreshCw, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { getStore, calculateWaitTime } from '../store';
import { QueueItem, Barber, QueueStatus } from '../types';

const WaitingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [queueItem, setQueueItem] = useState<QueueItem | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [position, setPosition] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const refreshData = () => {
    const state = getStore();
    const item = state.queue.find(q => q.id === id);
    if (item) {
      setQueueItem(item);
      const b = state.barbers.find(barb => barb.id === item.barberId);
      setBarber(b || null);
      
      // Real position in current active queue
      const activeQueueForBarber = state.queue.filter(q => 
        q.barberId === item.barberId && 
        (q.status === QueueStatus.WAITING || q.status === QueueStatus.IN_PROGRESS)
      );
      
      const idx = activeQueueForBarber.findIndex(q => q.id === item.id);
      setPosition(idx + 1);

      // Wait time: Sum of durations of people in front
      let wait = 0;
      if (idx > 0) {
        activeQueueForBarber.slice(0, idx).forEach(q => {
          q.serviceIds.forEach(sid => {
            const s = state.services.find(srv => srv.id === sid);
            if (s) wait += s.duration;
          });
        });
      }
      setEstimatedWait(wait);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: 'Mon suivi BarberQ',
      text: `Je suis en attente au salon ! Ma position : ${position}e`,
      url: window.location.href,
    };

    try {
      // Basic validation: ensure URL is valid for sharing
      if (!shareData.url || shareData.url.startsWith('about:')) {
        throw new Error('URL non partageable dans cet environnement');
      }

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error('Partage natif non supporté');
      }
    } catch (err) {
      console.warn('Echec du partage natif, copie dans le presse-papier :', err);
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Erreur de copie :', err);
    }
  };

  if (!queueItem) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Réservation introuvable</h2>
        <Link to="/" className="text-amber-500 mt-4 inline-block">Retour à l'accueil</Link>
      </div>
    );
  }

  const isCompleted = queueItem.status === QueueStatus.COMPLETED;
  const inProgress = queueItem.status === QueueStatus.IN_PROGRESS;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition">
          <ChevronLeft className="w-4 h-4" /> Retour
        </Link>
        <button onClick={refreshData} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Status Header */}
        <div className={`p-8 text-white text-center transition-colors duration-500 ${
          isCompleted ? 'bg-green-600' : inProgress ? 'bg-blue-600' : 'bg-amber-500'
        }`}>
          <div className="flex justify-center mb-4">
             {inProgress ? (
               <div className="bg-white/20 p-4 rounded-full animate-pulse">
                <Armchair className="w-10 h-10" />
               </div>
             ) : isCompleted ? (
                <div className="bg-white/20 p-4 rounded-full">
                  <RefreshCw className="w-10 h-10" />
                </div>
             ) : (
                <div className="bg-white/20 p-4 rounded-full">
                  <Clock className="w-10 h-10" />
                </div>
             )}
          </div>
          <h1 className="text-2xl font-bold">
            {isCompleted ? 'Prestation terminée !' : inProgress ? 'C\'est votre tour !' : 'Patience, ça arrive...'}
          </h1>
          <p className="opacity-90 mt-1">
            {isCompleted ? 'Merci de votre confiance.' : inProgress ? 'Prenez place sur le fauteuil.' : 'Conservez cette page ouverte.'}
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Info Section */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client</span>
                <p className="text-xl font-bold text-slate-800">{queueItem.clientName}</p>
              </div>

              {!isCompleted && !inProgress && (
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-400 block mb-1">Position</span>
                    <p className="text-2xl font-black text-slate-800">{position}e</p>
                  </div>
                  <div className="flex-1 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <span className="text-xs text-amber-600 block mb-1">Attente</span>
                    <p className="text-2xl font-black text-amber-800">~{estimatedWait} min</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={barber?.photo} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <span className="text-xs text-slate-400 block">Votre Coiffeur</span>
                  <p className="font-bold text-slate-800">{barber?.name || 'En cours d\'assignation'}</p>
                </div>
              </div>
            </div>

            {/* QR Section */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                <QRCodeSVG value={window.location.href} size={150} level="M" />
              </div>
              <p className="text-xs text-slate-400 mb-4 px-4 leading-relaxed">
                Scannez ce QR Code pour suivre votre attente sur un autre appareil.
              </p>
              <div className="flex flex-col gap-2 w-full">
                <button 
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-amber-500 transition"
                >
                  <Share2 className="w-4 h-4" /> Partager l'accès
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-amber-500 transition"
                >
                  {copySuccess ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? 'Lien copié !' : 'Copier le lien'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-slate-400 text-sm space-y-4">
        <p>Prestations sélectionnées : {queueItem.serviceIds.map(sid => getStore().services.find(s => s.id === sid)?.name).join(', ')}</p>
        <div className="flex justify-center gap-6 pt-4 border-t border-slate-200">
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-600">Wifi Gratuit</span>
            <span className="text-xs">BarberGuest / 12345678</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-600">Café Offert</span>
            <span className="text-xs">Demandez au comptoir</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;
