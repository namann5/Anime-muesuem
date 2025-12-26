import React from "react";
import animeTimeline from "../data/animeTimeline";
import "../styles/timeline.css";

function AnimeTimeline() {
    return (
        <div className="timeline-page">
            <h1>Anime History Timeline</h1>

            {animeTimeline.map((era) => (
                <section key={era.era} className="timeline-section">
                    <h2>{era.title}</h2>
                    <p>{era.description}</p>
                    <img src={era.image} alt={era.title} />
                </section>
            ))}
        </div>
    );
}

export default AnimeTimeline;
