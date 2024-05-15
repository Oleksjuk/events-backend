import { prismaClient } from "./src/model/PrismaClient.js";

// API: https://platform.seatgeek.com/#events
// CREATE clientId: https://seatgeek.com/account/develop

class EventsFetcher {
    clientId = "NDE1NjIxMzN8MTcxNTcyMjUyMi43NDM4NzQz"
    fetch_interval = Number(process.env.FETCH_INTERVAL)

    eventMapper = new EventMapper()
    requestOptions = {
        method: "GET",
        headers: new Headers(),
        redirect: "follow"
    }

    page = 1
    count = 10

    async requestEvents() {
        console.log(`Fetch events from page: ${this.page}, count: ${this.count}`);
        const response = await fetch(`https://api.seatgeek.com/2/events?per_page=${this.count}&page=${this.page}&client_id=${this.clientId}`, this.requestOptions)
        const body = await response.json()

        if(response.status == 403) {
            throw new Error(body.message)
        }

        body.events.forEach(async (event) => {
            const mappedEvent = this.eventMapper.map(event)
            const result = await prismaClient.event.upsert({
                where: {
                    fetchedEventId: mappedEvent.fetchedEventId
                },
                update: mappedEvent,
                create: mappedEvent
            })

            console.log(`Fetched event: fetchEventId:${result.fetchedEventId}, title: ${result.title}`)
        });

        this.page += 1
    }

    async start() {
        try {
            console.log(`Fetch process start, time: ${new Date(Date.now()).toISOString()}`)
            await new Promise((resolve,reject) => {
                setInterval(async () => {
                    await fetcher.requestEvents()
                }, this.fetch_interval);
            });
            process.exit();
        } catch(e) {
            console.error(e);
        } finally {
            process.exit();
        }
    }
}

class EventMapper {
    map(event) {
        const mappedEvent = {
            title: event.title,
            description: event.description,
            eventDate: Date.parse(event.datetime_utc),
            organizer: event.venue.name,
            fetchedEventId: event.id
        }

        if(mappedEvent.description === "" || mappedEvent.description === " ") {
            mappedEvent.description = this.buildDescription(event)
        }

        return mappedEvent
    }

    buildDescription(eventSource) {
        let base = `The event will feature such famous performers as `

        eventSource.performers.forEach((performer, index, performers) => {
            base += `\"${performer.name}\"`
            if(index === eventSource.performers.length - 1) {
                base += "."
            } else {
                base += ", "
            }
            
        })

        return base
    }
}

const fetcher = new EventsFetcher()
fetcher.start()

process.on('SIGINT',function(){
    console.log(`Fetch process exit, time: ${new Date(Date.now()).toISOString()}`)
});
