import SkillsOrbit from '../components/skills/SkillsOrbit';

const Skills = () => {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="section-title">Skills & Expertise</h1>
                    <p className="mt-4 section-subtitle mx-auto">
                        Technologies and tools I use to bring ideas to life
                    </p>
                </div>

                {/* Skills Orbit Component */}
                <SkillsOrbit />
            </div>
        </div>
    );
};

export default Skills;
